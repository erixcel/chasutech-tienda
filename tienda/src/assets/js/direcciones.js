
var config = {
  apiKey: "AIzaSyC7rACteHE7NLMXnQ3KXPLnnsumzUA5-Js",
  authDomain: "admin-tienda-erixcel.firebaseapp.com",
  projectId: "admin-tienda-erixcel",
  storageBucket: "admin-tienda-erixcel.appspot.com",
  messagingSenderId: "404375808899",
  appId: "1:404375808899:web:fa067f3a177d3ca6dd64b6",
  measurementId: "G-GGH3M2BMJ0"
}

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}


var recaptchaVerifier = new firebase.auth.RecaptchaVerifier('captha',{
	size : 'invisible'
});

recaptchaVerifier.render().then(function(widgetId) {
  window.recaptchaWidgetId = widgetId;
});

async function enviarSMS(phone) {
  try {
    const confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    return "success";
  } catch (error) {
    console.log('error', error);
    grecaptcha.reset(window.recaptchaWidgetId);
    recaptchaVerifier.render().then(function(widgetId) {
      grecaptcha.reset(widgetId);
    });
    if (error.code === 'auth/invalid-phone-number') return "invalid-number";
    if (error.code === 'auth/too-many-requests') return "many-requests";
    else return "error";
  }
}


async function verificarSMS(code){
	try {
		const result = await window.confirmationResult.confirm(code);
		return "success";
	} catch (error) {
		console.log("error", error);
		return "error";
	}
}

function reiniciar(){
	recaptchaVerifier.render().then(function(widgetId) {
		grecaptcha.reset(widgetId);
	});
}
