import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';

test('talent profiles accept HTTPS platforms and reject invalid profiles', async () => {
  const previous = process.env.EMAILJS_SERVICE_ID;
  delete process.env.EMAILJS_SERVICE_ID;
  try {
    for (const [index, profile, expected] of [
      [1, 'https://tiktok.com/@creator', 503],
      [2, '', 400],
      [3, 'javascript:alert(1)', 400],
      [4, 'https://', 400],
    ]) {
      let status;
      await handler({method:'POST', headers:{host:'example.test',origin:'https://example.test','x-real-ip':`test-${index}`},body:{kind:'talent',fields:{name:'Creator',email:'creator@example.test',category:'Lifestyle',primary_profile:profile}}}, {
        setHeader(){}, status(code){status=code;return this;}, json(){},
      });
      // Valid submissions reach the missing-service check without sending mail.
      assert.equal(status, expected, profile);
    }
  } finally {
    if (previous === undefined) delete process.env.EMAILJS_SERVICE_ID;
    else process.env.EMAILJS_SERVICE_ID = previous;
  }
});

async function invoke({method='POST', origin='https://example.test', body, ip='guard-test', length}={}) {
  let status, payload;
  await handler({method,headers:{host:'example.test',origin,'x-real-ip':ip,...(length?{'content-length':String(length)}:{})},body}, {
    setHeader(){},status(code){status=code;return this;},json(value){payload=value;},
  });
  return {status,payload};
}

test('contact rejects unsupported methods, foreign origins and oversized requests', async () => {
  assert.equal((await invoke({method:'GET'})).status,405);
  assert.equal((await invoke({origin:'https://other.test'})).status,403);
  assert.equal((await invoke({length:4_500_001})).status,413);
});

test('contact rejects invalid forms and accepts the bot trap without sending email', async () => {
  assert.equal((await invoke({body:{kind:'unknown',fields:{}}})).status,400);
  assert.equal((await invoke({body:{kind:'brand',fields:{email:'bad'}}})).status,400);
  assert.equal((await invoke({body:{website:'bot'}})).status,202);
});

test('contact throttles repeated submissions', async () => {
  for(let i=0;i<5;i++) assert.equal((await invoke({ip:'rate-test',body:{}})).status,400);
  assert.equal((await invoke({ip:'rate-test',body:{}})).status,429);
});
