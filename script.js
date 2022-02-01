/* Stubs + Schema
  users: {
    {
      "username": "test"
      "password": "9b7ecc6eeb83abf9ade10fe38865df4499be3568dcc507ae2ec3b44989cb0093" SHA256
      "name": name,
      "address": ..,
      ...
    }
  }
*/

function hashString( str ) {
  if (str.length % 32 > 0) str += Array(33 - str.length % 32).join("z");
  var hash = '', bytes = [], i = j = k = a = 0, dict = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','1','2','3','4','5','6','7','8','9'];
  for (i = 0; i < str.length; i++ ) {
      ch = str.charCodeAt(i);
      bytes[j++] = (ch < 127) ? ch & 0xFF : 127;
  }
  var chunk_len = Math.ceil(bytes.length / 32);   
  for (i=0; i<bytes.length; i++) {
      j += bytes[i];
      k++;
      if ((k == chunk_len) || (i == bytes.length-1)) {
          a = Math.floor( j / k );
          if (a < 32)
              hash += '0';
          else if (a > 126)
              hash += 'z';
          else
              hash += dict[  Math.floor( (a-32) / 2.76) ];
          j = k = 0;
      }
  }
  return hash;
}

function getUsers() {
  users = window.localStorage.getItem("usersTable");
  if (users == undefined) {
    users = [];
    window.localStorage.setItem("usersTable", JSON.stringify(users));
  } else {
    users = JSON.parse(users);
  }

  return users;
}

function getUser(username) {
  users = getUsers();
  findUser = users.filter(user => user.username.toLowerCase() == username.toLowerCase());

  if (findUser.length > 0) return findUser[0];
  return undefined;
}

function addUser(userRecord) {
  users = getUsers();
  users.push(userRecord);
  window.localStorage.setItem("usersTable", JSON.stringify(users));
  
  return true;
}

function deleteUser(username) {
  users = getUsers();
  newUsersTable = users.filter(user => user.username.toLowerCase() != username.toLowerCase());

  window.localStorage.setItem("usersTable", JSON.stringify(newUsersTable));
}

function updateUser(userRecord) {
  getUsr = getUser(userRecord.username);
  if (getUsr == undefined) return false;

  users = getUsers();
  for (user in users) {
    if (users[user].username == getUsr.username) {
      users[user] = userRecord;
      window.localStorage.setItem("usersTable", JSON.stringify(users));
      window.localStorage.setItem("authenticatedUser", JSON.stringify(users[user]));
      return true;
    }
  }
  return false;
}

function authUser(username) {
  user = getUser(username);
  window.localStorage.setItem("authenticatedUser", JSON.stringify(user));
}

function getAuthUser() {
  authedUser = window.localStorage.getItem("authenticatedUser");
  if (authedUser != undefined) return JSON.parse(authedUser);
  return undefined;
}

function getFeedbacks() {
  feedbacks = window.localStorage.getItem("feedbackTable");
  if (feedbacks == undefined) {
    feedbacks = [];
    window.localStorage.setItem("feedbackTable", JSON.stringify(feedbacks));
  } else {
    feedbacks = JSON.parse(feedbacks);
  }

  return feedbacks;
}

function addFeedback(feedback) {
  feedbacks = getFeedbacks();
  feedbacks.push(feedback);
  window.localStorage.setItem("feedbackTable", JSON.stringify(feedbacks));
}

// redirects user to login if theyre not authenticated
function isAuthMiddleware() {
  if (getAuthUser() == undefined) window.location = "login.html";
}

function loginCancel(){
  // redirects back to main Screen (Language Selection) when login cancelled
  window.location = '406MainScreen.html';
}

function redirectTo(path) {
  window.location = path;
}

function logout(){
  //unauthenticate user
  window.localStorage.removeItem("authenticatedUser");
  window.alert('You are now logged out, you will be redirected to the portal in 3 seconds...');
  setTimeout(function(){
    window.location = 'portalScreen.html'
  }, 5000);
}

function checkLogin(){
  const usrName = document.querySelector('#username').value;
  const password = hashString(document.querySelector('#password').value);
  
  test_usr = getUser(usrName);
  loginTimedOutUntil = window.localStorage.getItem("loginTimedOutUntil");
  
  // initialize 
  if (window.localStorage.getItem("loginAttemptCounter") == undefined) {
    window.localStorage.setItem("loginAttemptCounter", 0);
  }
  loginAttemptCounter = window.localStorage.getItem("loginAttemptCounter");

  // check if user does not exist
  if (test_usr == undefined) {
    window.alert("User does not exist, please try again");
    return;
  }
  // check login attempt counter
  if (loginAttemptCounter == 3) {
    window.localStorage.setItem("loginTimedOutUntil", Date.now() + 5000);

    // reset loginAttemptCounter to 0
    window.localStorage.setItem("loginAttemptCounter", 0 );
    window.alert("You have been timed out, please try again in 10 minutes.");
    return;
  }

  // check if user is still timed out from failed login attempts
  if (loginTimedOutUntil != undefined){
    if (Date.now() <= loginTimedOutUntil) {
      window.alert("You are still timed out, please try again later")
      return;
    } else {
      window.localStorage.removeItem("loginTimedOutUntil");
    }
  }

  // check if password is incorrect
  if (test_usr.password != password) {
    // increment password attempts
    window.localStorage.setItem("loginAttemptCounter", parseInt(loginAttemptCounter) + 1) 

    window.alert("Wrong password, please note 3 failed passwords attempts will result in being timed out for 10 minutes");
    return;
  }
  
  
  // all checks passed, authenticate user
  authUser(usrName);
  
  // alert user they have been authenticated
  window.alert("You have successfully logged in! Redirecting you to the portal screen..");

  // redirect user to portal
  window.location = "portalScreen.html";
  
}

function validatePasswordStrength(password) {
  var hasLowerCase = false;
  var hasUpperCase = false;
  var hasNumber = false;
  var hasSymbol = false;
  if (password.match(/[a-z]+/)) {
    hasLowerCase = true;
  } 
  if (password.match(/[A-Z]+/)) {
    hasUpperCase = true;
  } 
  if (password.match(/[0-9]+/)) {
    hasNumber = true;
  }
  if (password.match(/[$@#&!]+/)) {
    hasSymbol = true;
  }

  var passwordStrengthError = "";

  if (hasLowerCase == false) {
    passwordStrengthError += "Password must contain at least 1 lower case character<br>"
  }

  if (hasUpperCase == false) {
    passwordStrengthError += "Password must contain at least 1 upper case character<br>"
  }
  
  if (hasNumber == false) {
    passwordStrengthError += "Password must contain at least 1 number<br>"
  }

  if (hasSymbol == false) {
    passwordStrengthError += "Password must contain at least 1 symbol<br>"
  }

  if (passwordStrengthError != "") {
    return passwordStrengthError
  }

  return true;
}

function checkRegister(){
  
  // retrieving all inputs from registration
  const registry = document.querySelectorAll('input');

  // validate if password is secure
  passwordValidation = validatePasswordStrength(registry[7].value);
  if (passwordValidation !== true) {
    registrationErrorLabel = document.getElementById("registrationErrorLabel");
    registrationErrorLabel.innerHTML = "ERRORS: <br><br>" + passwordValidation;
    registrationErrorLabel.style.display = "block";
    return;
  } else {
    document.getElementById("registrationErrorLabel").style.display = "none";
  }

  // validate if username is at least 4 characters long and not more than 32 characters long
  if (registry[6].value.length < 4 || registry[6].value.length > 32) {
    window.alert("Username must be at least 4 characters long and not more than 32 characters long.");
    return;
  }

  // check if user is authenticated already
  if (getAuthUser() != undefined) {
    window.alert("You already logged into a user already, redirect to main page in 3 seconds...");
      setTimeout(function(){
        window.location = "portalScreen.html";
      }, 3000);
      return;
  }

  // check if user exists already
  if (getUser(registry[6].value) != undefined) {
    window.alert("User exists already!");
    return;
  }
  
  // checks passed, create record
  const userRecord = {
    firstName: registry[0].value, 
    secondName: registry[1].value,
    address: registry[2].value,
    phoneNum: registry[3].value,
    email: registry[4].value,
    securityAnswer: registry[5].value,
    username: registry[6].value,
    password: hashString(registry[7].value)
  }
  
  // store record in db
  addUser(userRecord);

  // authenticate user
  authUser(registry[6].value);

  // inform user that have been registered
  window.alert("You have successfully registered to our website!");

  // redirect user to reporting page
  window.location = "ReportingScreen.html";

}

// Attention to ReportingScreen.html
// Changed input type=button inside form to be input type=checkbox, not sure if that was intended
function reporting(){
  // collection of problems to be cross referenced when applying problems to address
  const problems = ['Utility Failures', 'Potholes', 'City Property Vandalism', 'Eroded Streets', 'Tree Collapse', 'Flooded Streets', 'Mould and Spore growth', 'Garbage or any other Road Blocking Object'];

  //retrieve address from reporting Screen
  const address = document.querySelector('#fname').value

  // retrieve all checkbox inputs from reporting Screen
  const report = document.querySelectorAll('#click')
  // mapping for checked boxes
  const to_do = []

  if (address.length == 0){
    window.alert("Please enter an address")
    return;
  }

  // applying problems to intermediate variable to_do
  for ( i = 0; i < report.length; i++){
    if (report[i].checked == true) {
      to_do.push(problems[i]); // push index of checked options in report
    }
  };

  if(to_do.length == 0){
    window.alert("Please select at least one option")
    return;
  }

  const reportDetails= {
    username: getAuthUser().username,
    address: address,
    problems: to_do
  }
  
  reports = getReports();
  reports.push(reportDetails);

  // adding problems (in to_do) to db with address as the key
  window.localStorage.setItem("reportsTable", JSON.stringify(reports))
  window.alert("Report has been successfully sent.")
}

// redirects portal to designated page
// @param address - URI of designated page
function redirect(address) {
  // determines if an option is selected, prompts user if one is not 
  console.log(address.length)
  if (address.length == 0) {
    window.alert("Please select an option and then press 'GO'");
    return;
  }
  window.location = address;
  return true;
}

// stores address for redirect everytime an option on the portal is selected
function redirectHelper(address){
  this.address = address;
}

// retrieve all reports in reportsTable
function getReports(){
  var reports = window.localStorage.getItem("reportsTable")
  if (reports == undefined) {
    reports = [];
    window.localStorage.setItem("reportsTable", JSON.stringify(reports));
  } else {
    reports = JSON.parse(reports);
  }

  return reports;
}


// retrieve all reports made by authenticated user
function getUserReports(){

  username = getAuthUser().username;
  
  reports = getReports();
  // array to be filled with reports of authorized user
  currentUser = []

  for ( i = 0; i < reports.length; i++){
    if ((reports[i].username) == username){
      currentUser.push(reports[i])
    }
  }
  return currentUser;
}


function updateReport(newReport){
  currentUser = getUserReports();
  oldReport = JSON.parse(window.localStorage.getItem("ToBeDeleted"))
  for (let i = 0; i < currentUser.length; i++){
    if ( (currentUser[i].address == oldReport.address ) && currentUser[i].username == oldReport.username && JSON.stringify(currentUser[i].problems) == JSON.stringify(oldReport.problems) ){
      // deletes old entry and adds new entry
      deleteReport(currentUser[i]);
      // add new entry as replacement
      reporting(newReport);

    }
  }

}


function deleteReport(report){
  currentUser = getUserReports();
  
  // building new reports 
  var newReports = []

  for (let i = 0; i < currentUser.length; i++){
    if ( (currentUser[i].address != report.address) || (currentUser[i].username != report.username) || JSON.stringify(currentUser[i].problems) != JSON.stringify(report.problems) ){
      // add problems that are not the selected problem to deleted based on the username, address and the problems themselves
      newReports.push(currentUser[i])
    }
  }
  // update reportsTable with updated problem information
  window.localStorage.setItem("reportsTable", JSON.stringify(newReports))
  window.location.reload();
  return true;
}

function getSurveys() {
  var surveys = window.localStorage.getItem("citySurveysTable")
  if (surveys == undefined) {
    surveys = [];
    window.localStorage.setItem("citySurveysTable", JSON.stringify(surveys));
  } else {
    surveys = JSON.parse(surveys);
  }

  return surveys;
}

function addSurvey(survey) {
  surveys = getSurveys();
  surveys.push(survey);
  window.localStorage.setItem("citySurveysTable", JSON.stringify(surveys));
}

function promptUserForSurvey() {
  if (window.location.href.indexOf("notify.html") == -1) {
    loggedUser = getAuthUser();
    if (loggedUser == undefined || loggedUser.dismissedSurvey == true) return false;
    
    if (loggedUser.hasTakenSurvey == undefined || loggedUser.hasTakenSurvey == "") {
      if (confirm("Would you like to part-take in a survey about the city?")) {
        redirectTo("notify.html");
      } else {
        loggedUser.dismissedSurvey = true;
        updateUser(loggedUser);
      }
    }
  } else {
    console.log('nope');
  }
}

promptUserForSurvey();