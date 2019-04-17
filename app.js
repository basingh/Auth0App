
 var rulesPerClient = [];

window.addEventListener('load', function() {
  var idToken;
  var accessToken;
  var expiresAt;

  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';



  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    responseType: 'token id_token',
    scope: 'openid',
    leeway: 60
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');

  // buttons and event listeners
  var homeViewBtn = document.getElementById('btn-home-view');
  var loginBtn = document.getElementById('qsLoginBtn');
  var logoutBtn = document.getElementById('qsLogoutBtn');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    loginView.style.display = 'none';
  });

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  logoutBtn.addEventListener('click', logout);

  function localLogin(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    accessToken = authResult.accessToken;
    idToken = authResult.idToken;
  }

  function renewTokens() {
    webAuth.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        localLogin(authResult);
      } else if (err) {
        alert(
            'Could not get a new token '  + err.error + ':' + err.error_description + '.'
        );
        logout();
      }
      displayButtons();
    });
  }

  function logout() {
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    // Remove tokens and expiry time
    accessToken = '';
    idToken = '';
    expiresAt = 0;

    webAuth.logout({
      return_to: window.location.origin
    });

    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiration = parseInt(expiresAt) || 0;
    return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        localLogin(authResult);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        homeView.style.display = 'inline-block';
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
      displayButtons();
    });
  }
// Test code to get Rules and Clients start
	function getAuthData(url) {
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET',url);
		xhr.onload = function() {
			console.log ("inside onload");
			var status = xhr.status;
			if (status === 200) {
			
			var rule = JSON.parse(xhr.responseText);
     		 rulename = rule[0]["name"];
			 ruleScript = rule[0]["script"];
			 
			var findMatch = ruleScript.match(/(context.clientName).=.\'(.*?)\'/);
				
				 if (findMatch) {
				 var clientAllowed = findMatch[2];
				 console.log("got client data  "+clientAllowed);
				 console.log("got client data  "+rulename);
				
				 
				


		} else {
        console.log (JSON.parse(
        xhr.responseText).message)
      }
    };
		xhr.setRequestHeader( 'authorization','Bearer '+
      MANAGEMENT_API_CLIENT_TOKEN');
	  xhr.setRequestHeader( 'content-type', 'application/json');
	   
	    xhr.send();
			
			
			
		}

	

	function getRules(){
		const url = `https://${AUTH0_DOMAIN}/api/v2/rules`;
		return getAuthData(url);
	}
	
	function getApps(){
		const url = `https://${AUTH0_DOMAIN}/api/v2/clients`;
		return getAuthData(url);
	}


   function createRule(){
	   var options = new XMLHttpRequest();
	   const url = `https://${AUTH0_DOMAIN}/api/v2/rules`;
		options.open('POST',url);
		options.onload = function() {
			console.log ("inside onload");
			var status = options.status;
			if (status === 200) {
			//callback(null, xhr.response);
			console.log ("inside 200");
			console.log (
        options.responseText)
		} else {
        console.log (JSON.parse(
        options.responseText).message)
      }
    };
		options.setRequestHeader( 'authorization','Bearer '+ MANAGEMENT_API_CLIENT_TOKEN');
	  
	  
	  var body = JSON.stringify({
		  name: 'my-rules',
		script: 'function (user, context, callback) {callback(null, user, context);}',
		clientName: 'myLoginApp',
		order: 6,
		enabled: true }//,
	  }
	  )
	  options.setRequestHeader( 'content-type', 'application/json');
	   console.log(options);
	    options.send(body);
   }
   
// Test code to get Rules and Clients start
  function displayButtons() {
    if (isAuthenticated()) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      loginStatus.innerHTML = 'You are logged in!';
	//  alert (accessToken);
	  getRules();
	  getApps();
	//  createRule();
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    renewTokens();
  } else {
    handleAuthentication();
  }
});
