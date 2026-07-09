
/*
    || Script for changing theme to light theme ||
    Good explanations for js can be found here:
    https://www.w3schools.com

    Based on https://www.youtube.com/watch?v=_gKEUYarehE and
    https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_iframe_contentdocument

    Idk how I managed to do the iframe stuff. The order of blocks matters. 
*/


/* set some variables */
let lightmode = localStorage.getItem("lightmode")                       
const themeSwitch = document.getElementById("theme-switch")
const codeblock = document.getElementById("codeblock")
const prismjsTheme = document.getElementById("prismjs-theme")
const iframe = document.getElementById("iframe");



/* iframe theme changing, these are basically the same as normal theme changing 
but done in the iframe page */

const EnableIframeLightmode = () => {
   /* var iframe = document.getElementById("iframe"); */
    var innerWindow = iframe.contentWindow;
    if (innerWindow.document)innerWindow = innerWindow.document;
    innerWindow.body.classList.add("lightmode");                        

    var innerWindowPrismjs = innerWindow.getElementById("prismjs-theme")    
    innerWindowPrismjs.href = "/assets/prismjs-themes/light-custom.css"       

}

const DisableIframeLightmode = () => {
   /* var iframe = document.getElementById("iframe"); */
    var innerWindow = iframe.contentWindow;
    if (innerWindow.document)innerWindow = innerWindow.document;
    innerWindow.body.classList.remove("lightmode");                 

    var innerWindowPrismjs = innerWindow.getElementById("prismjs-theme")
    innerWindowPrismjs.href = "/assets/prismjs-themes/mocha.css"

}

/* theme changing */

const enableLightmode = () => {
    document.body.classList.add('lightmode')                    
    localStorage.setItem('lightmode', 'active')                 /* saves lightmode status to localstorage  */

    prismjsTheme.href = "/assets/prismjs-themes/light-custom.css"  /* Sets prismjs theme */

    if (document.body.contains(iframe)) {           /* These conditions check if page contains iframe. If it tried to execute whitout an iframe in page, */
    EnableIframeLightmode()                         /* script would break or atleast result in unwanted errors */
    } else {return}

                            
}

const disableLightmode = () => {
    document.body.classList.remove('lightmode')
    localStorage.setItem('lightmode', null)

    prismjsTheme.href = "/assets/prismjs-themes/mocha.css"

    if (document.body.contains(iframe)) {
    DisableIframeLightmode()
    } else {return}

}

document.addEventListener("DOMContentLoaded", function () {
    console.log("content loaded")
    if(lightmode === "active") enableLightmode()                  /* If lightmode active in localstorage, enable without any interaction */
});                                                             /* Waits for page html to load becouse if iframe isn't loaded when this runs, the script breaks  */
    

/* event listener for element "theme-switch" */
themeSwitch.addEventListener("click", () => {                           /* if lightmode in localstorage is active; disable it on click and vise-versa */
    lightmode = localStorage.getItem('lightmode')
    lightmode !== "active" ? enableLightmode() : disableLightmode() 
})