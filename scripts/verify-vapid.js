const webpush = require('web-push');
const VAPID_PUBLIC_KEY = "BMOvp5mdoVJtKnCBcFX72VO23TXLM0xGIltKi5GTjEh8jDS7TLPxxgW9Ba6hjr27K5jVhLYgJz7cJl8R_c4ZBMo";
const VAPID_PRIVATE_KEY = "CtWECd4rBXDsF9SZO8meTaI17cu5nim7JVDxfgk5zCo";
const VAPID_SUBJECT = "mailto:violstam23@gmail.com";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log("VAPID Keys Valid");
} catch (e) {
  console.error("VAPID Keys Invalid:", e.message);
}
