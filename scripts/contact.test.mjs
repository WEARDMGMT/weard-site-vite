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
