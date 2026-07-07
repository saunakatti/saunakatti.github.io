
/*
    || Script for changing theme to light theme ||
    Good explanations for js can be found here:
    https://www.w3schools.com

    Based on https://www.youtube.com/watch?v=_gKEUYarehE and
    https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_iframe_contentdocument

    Adds class "lighmode" to body of document. The class contains color variables in style.css.
    These overide the root colors defined in style.css. The order of blocks matters. 
*/


/* set some variables */
let lightmode = localStorage.getItem("lightmode")                       
const themeSwitch = document.getElementById("theme-switch")
const iframe = document.getElementById("iframe")

/* iframe theme changing */
const EnableIframeLightmode = () => {
 /* var iframe = document.getElementById("iframe"); */
  var ogfile = (iframe.contentWindow || iframe.contentDocument);
  if (ogfile.document)ogfile = ogfile.document;
  ogfile.body.classList.add("lightmode")
}

const DisableIframeLightmode = () => {
 /* var iframe = document.getElementById("iframe"); */
  var ogfile = (iframe.contentWindow || iframe.contentDocument);
  if (ogfile.document)ogfile = ogfile.document;
  ogfile.body.classList.remove("lightmode")
}

/* theme changing */
const enableLightmode = () => {
    document.body.classList.add('lightmode')      
    localStorage.setItem('lightmode', 'active')

    if (document.body.contains(iframe)) {           /* These conditions check if page contains iframe. If it tried to execute whitout an iframe in page, script would break. */
    EnableIframeLightmode()
    } else {return}
}

const disableLightmode = () => {
    document.body.classList.remove('lightmode')
    localStorage.setItem('lightmode', null)

    if (document.body.contains(iframe)) {
    DisableIframeLightmode()
    } else {return}
}

if(lightmode === "active") enableLightmode()    /* If lightmode active in localstorage, enable without any interaction */

/* event listener for element "theme-switch" */
themeSwitch.addEventListener("click", () => {                           /* if lightmode in localstorage is active; disable it and vise-versa */
    lightmode = localStorage.getItem('lightmode')
    lightmode !== "active" ? enableLightmode() : disableLightmode() 
})