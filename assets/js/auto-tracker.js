/**
 * AUTO TRACKER LIKE JS
 *
 * @objectives
 * - Track forms
 * - Use Session storage
 * - Send data
 *
 *
 *
 * @type {{init: Function}}
 */

try{
  var ClickxTracker = {
    init: function(options){
      var default_options = {
        visitExpire: 4*60*60*1000,
        visitorExpire: 365*24*60*60*1000,
        cId: null
      };

      /* Set default option if option not available */
      for(var i in default_options){
        if(default_options.hasOwnProperty(i)){
          if(!options[i]){
            options[i] = default_options[i]
          }
        }
      }
      new ClickxTrackerClass(options)
    }
  };

  function ClickxTrackerClass(options){

    var _this                 = this;
    this.cId                  = options.cId;
    this.visitId              = "";
    this.visitorsId           = "";
    this.pageUrl              = "https://1b0396d7.ngrok.io/tracker.gif "; //"http://job_search.dev/auto-tracker-image.gif";
    this.formUrl              = "https://1b0396d7.ngrok.io/cookie_tracker/form_data";//"http://job_search.dev/auto-tracker-form.gif";
    this.guessPersonality     = "https://1b0396d7.ngrok.io/auto-tracker-guess.gif";
    this.getUniquFormKeys     = "https://1b0396d7.ngrok.io/cookie_tracker/form_details_from_tracker_id/";
    this.queueFormData        = [];
    this.ajaxOnProcess        = false;

    this.formUniqueKeys       = [];


    this.scanFormAndApplyID = function(){
      var forms = document.querySelectorAll('form');
      for(var fID=0; fID <forms.length;fID++){
        var currentForm = forms[fID];
        var currentFormElements = currentForm.elements;
        var formElementString = [];
        var formElementSelect = [];
        var formElementInput = [];
        for(var fEle=0;fEle<currentFormElements.length;fEle++){
          var mFormElement = currentFormElements[fEle];
          switch (mFormElement.type) {
            case 'select-one':
            case 'select-multiple':
              formElementSelect.push(mFormElement);
              break;
            default:
              if (mFormElement.type == 'submit') continue
              formElementInput.push(mFormElement);

              break;
          }
        }


        //for(var selectField=0; selectField < formElementSelect.length;selectField++){
        //  mFormElement = formElementSelect[selectField]
        //  if(mFormElement.id && mFormElement.id!="") formElementString.push('id='+mFormElement.id);
        //  if(mFormElement.className &&  mFormElement.className!="") formElementString.push('class='+mFormElement.className);
        //  if(mFormElement.type &&  mFormElement.type!="") formElementString.push('type=select');
        //  if(mFormElement.name &&  mFormElement.name!="") formElementString.push('name='+mFormElement.name);
        //  if(mFormElement.placeholder && mFormElement.placeholder!="") formElementString.push('placeholder='+mFormElement.placeholder);
        //  if(mFormElement.type=="checkbox" || mFormElement.type=="radio"){
        //    if(mFormElement.value && mFormElement.value!="") formElementString.push('value='+mFormElement.value);
        //  }
        //  if(mFormElement.required &&  mFormElement.required!="") formElementString.push('required='+mFormElement.class)
        //
        //}

        for (var inputField = 0; inputField < formElementInput.length; inputField++) {
          mFormElement = formElementInput[inputField];
          if (mFormElement.id && mFormElement.id != "") formElementString.push('id=' + mFormElement.id);
          if (mFormElement.className && mFormElement.className != "") formElementString.push('class=' + mFormElement.className);
          if (mFormElement.type && mFormElement.type != "") formElementString.push('type=' + mFormElement.type);
          if (mFormElement.name && mFormElement.name != "") formElementString.push('name=' + mFormElement.name);
          if (mFormElement.placeholder && mFormElement.placeholder != "") formElementString.push('placeholder=' + mFormElement.placeholder);
          if (mFormElement.required && mFormElement.required != "") formElementString.push('required=' + mFormElement.class)
        }
        var SHA256Form = sha256(formElementString.join("&"));

        currentForm.dataset.clickxHash = SHA256Form;



      }

    }
    /**
     * @use : Get Form unique keys
     */

    this.fetchFormDetailsFromServer = function(cId){
      if(typeof _this.cId == "undefined" || _this.cId== null) throw new  Error("Customer ID is not present");
      var fetchFormUniqueKeys = new XMLHttpRequest();
      fetchFormUniqueKeys.open('GET',encodeURI(_this.getUniquFormKeys+_this.cId),false);
      fetchFormUniqueKeys.onreadystatechange = function(){
        if(fetchFormUniqueKeys.readyState == 4 && fetchFormUniqueKeys.status == 200){
          var responseJSON = JSON.parse(fetchFormUniqueKeys.responseText);
          var formServerArray = responseJSON;
          for (var eachForm = 0; eachForm < formServerArray.length; eachForm++) {
            var eachFormObject = formServerArray[eachForm];
            var hashedFormElement = document.querySelectorAll('[data-clickx-hash="' + eachFormObject.form_hash + '"]');
            if (hashedFormElement.length > 0) {
              console.log(hashedFormElement)
              hashedFormElement[0].dataset.clickxId = eachFormObject.form_id;
              delete hashedFormElement[0].dataset.clickxHash
            }
          }
        }
      };
      fetchFormUniqueKeys.send();
    };
    this.scanFormAndApplyID();
    this.fetchFormDetailsFromServer(_this.cId);// Fetch Form Unique Keys
    /**
     * Generate secrets key
     * @returns {string}
     */
    this.generateSecretKey = function(){
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };


    /* Initial Stages */
    /* Create VisitID and VisitorsID and store it in cookies */

    var allDataObject =  {
      form_submit_data:[],
      view_change_data:[],
      event_change_data:[]
    };



    /* Set Session if not exists */

    this.setStorageIfNotExist = function(key_a,allDataObject){
      if(sessionStorage.getItem(key_a)){
        allDataObject[key_a] = JSON.parse(sessionStorage.getItem(key_a))
      }else{
        sessionStorage.setItem(key_a,JSON.stringify(allDataObject[key_a]));
      }
    };

    /* Check existence and set default values */
    for(var key_a in allDataObject){
      if(allDataObject.hasOwnProperty(key_a)){
        _this.setStorageIfNotExist(key_a,allDataObject)
      }
    }
    this.getSessionData = function(key){
      allDataObject[key] = JSON.parse(sessionStorage.getItem(key))|| [];
    };
    this.removeSessionData = function(key){
      sessionStorage.removeItem(key);
    };
    /* Set session data */
    this.setSessionData = function(key,data,clear){
      if(typeof clear=="undefined") clear=false;
      if(clear){
        console.log("Remove")
        _this.removeSessionData(key);
      }
      _this.getSessionData(key);
      if(allDataObject[key].length < 5){
        if(Array.isArray(data)){
          for(var ai=0; ai<data.length; ai++){
            allDataObject[key].push(data[ai]);
          }
        }else{
          allDataObject[key].push(data);
        }
        sessionStorage.setItem(key,JSON.stringify(allDataObject[key]))
      }else{
        _this.removeSessionData(key)
      }
    };

    /* end session data */

    /**
     *
     * @param cname
     * @returns {*}
     */
    this.getCookies = function(cname){
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length,c.length);
        }
      }
      return "";
    };

    /**
     *
     * @param cookieName
     * @param value
     * @param cookiesExpire
     */
    this.setCookies = function(cookieName,value,cookiesExpire){
      var d = new Date();
      d.setTime(d.getTime() + cookiesExpire);
      var expireTime = d.toUTCString();
      document.cookie= cookieName+"="+value+";expires="+expireTime+";path=/";
    };

    this.setVisitIds = function(variableId,variableName,value,expireTime,clear){
      // Check cookies or create one
      if(_this.getCookies(variableName)==""){
        _this[variableId] = _this.generateSecretKey();
        _this.setCookies(variableName,value,expireTime);
      }else{
        _this[variableId] = _this.getCookies(variableName);
      }
    };

    /** VISITORS ID **/
    this.setVisitIds('visitorsId',"visitorsId",this.generateSecretKey(),options.visitorExpire);
    /** END VISITORS ID */



    this.sendPageViewData = function(url){
      if(allDataObject['view_change_data'] && Array.isArray(allDataObject['view_change_data']) && ['view_change_data'].length > 0){
        var sendViewData = new XMLHttpRequest();
        var sendData = (JSON.stringify(allDataObject['view_change_data']));
        sendViewData.open('GET',url+'?data='+sendData,false);
        sendViewData.send();
      }
    };
    /* Track Url Changes */
    window.onbeforeunload  = function(){
      _this.getSessionData('view_change_data');
      _this.sendPageViewData(_this.pageUrl)
    };
    /* end Track Url changes */


    this.sendFormDataToQueue = function(formData,form){

      _this.queueFormData = [{
        formData: formData,
        time: (new Date()).getTime(),
        queued: true,
        formId: (form && form.id) ? form.id : null,
      }];
      _this.setSessionData('form_submit_data',_this.queueFormData)
    };

    /**
     *
     * @param currentFormData { FORM DATA }
     * @param form {CurrentForm}
     */
    this.sendFormDataToServer = function(currentFormData,form){
      try{
        _this.ajaxOnProcess = true;
        var sendFormData = new XMLHttpRequest();
        sendFormData.open('POST',_this.formUrl,true);
        sendFormData.setRequestHeader("Content-Type", "application/json");
        sendFormData.onreadystatechange= function(){
          //debugger
          if((sendFormData.readyState == 4)  && sendFormData.status== 200){
            _this.ajaxOnProcess = false;
            if(typeof form !="undefined"){
              // Clear Data from session
              try{
                _this.removeSessionData('form_submit_data');
              }catch(e){
                console.log(e)
              }
              form.submit();
            }
          }else if(sendFormData.status!=200){
            _this.sendFormDataToQueue(currentFormData,form);
            if(typeof form !="undefined"){
              form.submit();
            }
          }else{
            //nothing
          }
        }
        sendFormData.send(JSON.stringify({data:(JSON.stringify(currentFormData)),vId:_this.visitId,vsId: _this.visitorsId,cId:(_this.cId || null)}));
      }catch(e){
        // _this.sendFormDataToQueue(currentFormData)
      }
    };
    this.formDataSubmission = function(){
      if(1==1){// no selected forms, go for all forms
        var allForms = document.querySelectorAll('form');

        for(var form of allForms){

          try{
            form.addEventListener('submit', function(event){
              var currentFormData = [];
              event.preventDefault();
              var elements = this.elements;
              try{
                var shouldNotInclude = ['submit','button'];
                for(var element of elements){
                  try{
                    if(shouldNotInclude.indexOf(element.type) == - 1){
                      if(element.value!=""){
                        var shouldSave = {
                          name: element.name || element.id,
                          value: element.value || '',
                          type: element.type,
                          time: (new Date()).getTime()
                        };
                        if(element.type =="checkbox" || element.type == "radio"){
                          shouldSave['checked'] = typeof element.checked!="undefined" ? element.checked:false
                        }
                        // Map form
                        var guessAssumptionList = [
                          'company|organization',
                          'last|lname|last_name|lastName',
                          'first|fname|first_name|firstName',
                          'middle|mname',
                          'fullname|contact_name|name',
                          'subscribe',
                          'title|role',
                          'salutation|greeting',
                          'nick',
                          'email',
                          'tel|phone|contact',
                          'address|city|town|location',
                          'employee|employer|team',
                          'birthday|dob',
                          'fax',
                          'site|link|url',
                          'postal|zip|code',
                          'country|nation|nationality',
                          'twitter',
                          'facebook',
                          'google',
                          'linkedin'
                        ];

                        for(var ri=0; ri < guessAssumptionList.length;ri++){
                          if((new RegExp(guessAssumptionList[ri],'i')).test(element.name)){
                            try{
                              var guessArray = element.name.match(new RegExp(guessAssumptionList[ri],'i'));
                              if(Array.isArray(guessArray) && guessArray.length > 0){
                                var guessValue = getCurrespondingGuessName(guessArray[0]);
                                if(guessValue!=null){
                                  shouldSave['guess'] =guessValue;
                                }
                                break;
                              }
                            }catch(e){
                              console.log(e)
                            }
                          }
                        }

                        currentFormData.push(shouldSave)

                      }
                    }
                  }catch(e){
                    console.log(e)
                    // Save currentFormData if ajax failed
                  }
                }
                if(Array.isArray(currentFormData) && currentFormData.length > 0){
                  _this.sendFormDataToServer(currentFormData,form)
                  // Check existing forms and remove it
                }
              }catch(e){
                console.log(e)
              }
              return true;
            })
          }catch(er){
            console.log(er)
          }
        }
      }
    }

    /* FORM SUBMISSION SECTION */


    // Support form on submit



    /* END FORM SUBMISSION */
    this.sendGuessName = function(input){

      _matchRegeXAndReturnValue(input, function(key,value){
        console.log(key,value)
        if(key && value){
          var guess = {};
          guess['visitId'] = _this.visitId;
          guess['visitorId'] = _this.visitorsId;
          guess[key] = value;
          guess['guess'] = key;
          guess['cId'] = _this.cId;
          console.log(guess)
          var sendGuessRequest = new XMLHttpRequest();
          var url = _this.guessPersonality+'?data='+encodeURIComponent(JSON.stringify(guess));
          sendGuessRequest.open('GET',url,true);
          sendGuessRequest.send();
        }
      });
    };
    this.guessSession = function(){
      var allInputElements = document.getElementsByTagName('input');
      for(var input = 0; input< allInputElements.length;input++){
        console.log(input, allInputElements[input]);
        if(typeof allInputElements[input]!= "undefined"){
          allInputElements[input].addEventListener('blur', function(e){
            console.log(e.target)
            _this.sendGuessName(e.target)
          })
        }
      }
    }
    /* For the first page */
    this.getQueryParams = function(){
      var queryParamCheck =  /(.*?)(?:\=(.*?))?(&|$)/g;
      var currentQueryParams = {};
      var queryParams = document.location.href.match(/\?(.*?)(#|$)/);
      console.log(queryParams)
      if(!queryParams) return {};
      queryParams = typeof queryParams[1]!="undefined"? queryParams[1]:[];
      console.log(queryParams);
      //debugger
      for(;;){
        console.log('HELLLO')
        var getEachParamsCheck = queryParamCheck.exec(queryParams);
        console.log(getEachParamsCheck[1])
        if(!getEachParamsCheck[1]){
          console.log(getEachParamsCheck[1])
          break; // If second element not present break loop
        }
        currentQueryParams[getEachParamsCheck[1]] = getEachParamsCheck[2];
      }
      console.log(currentQueryParams);
      return currentQueryParams || {};
    };
    this.getUTMParams = function(){
      var utmParams = {};
      var getCurrentQueryParams = _this.getQueryParams();
      var allowedUTMPParams = ["utm_campaign", "utm_source", "utm_medium", "utm_term", "utm_content"];
      for(var keys in getCurrentQueryParams){
        if(getCurrentQueryParams.hasOwnProperty(keys)){
          if(allowedUTMPParams.indexOf(keys)!=-1){
            utmParams[keys] = getCurrentQueryParams[keys]
          }
        }
      }
      return utmParams || {};
    };
    window.addEventListener('load', function(event){
      //debugger
      var currentUTMParams = {};
      try{
        // Create visit id in every browser load
        _this.setVisitIds('visitId',"visitId",_this.generateSecretKey(),options.visitExpire);
        _this.getSessionData('view_change_data');
        var currentPageDetails = {
          l: encodeURIComponent(location.host+location.pathname),
          ts: (new Date()).getTime(),
          tt: document.title,
          sW: window.screen.width,
          sH: window.screen.height,
          p: (navigator.platform || null),
          referrer: encodeURIComponent(document.referrer),
          vsId: _this.visitorsId,
          vId: _this.visitId,
          cId: _this.cId,
          ev:'visit'
        };
        currentUTMParams = _this.getUTMParams();
        if(typeof currentUTMParams != "undefined" && Object.keys(currentUTMParams).length > 0){
          currentPageDetails['utm'] = currentUTMParams
        }
        allDataObject['view_change_data'] =[(currentPageDetails)];
        _this.setSessionData('view_change_data',allDataObject['view_change_data'],true);
      }catch(e){
        console.log(e)

      }

      _this.formDataSubmission();
      _this.guessSession();
      // visit cookie
    });


    /* INTERVAL TO SEND QUEUED */
    setInterval(function(){
      if(!_this.ajaxOnProcess){//If ajax not running
        _this.getSessionData('form_submit_data');
        if(Array.isArray(allDataObject['form_submit_data']) && allDataObject['form_submit_data'].length > 0){
          allDataObject['form_submit_data'] = _removeDuplicates(allDataObject['form_submit_data'],'time')
          try{
            for(formDataQueue of allDataObject['form_submit_data']){
              _this.sendFormDataToServer(formDataQueue.formData);
              allDataObject['form_submit_data'].pop();
            }
            _this.setSessionData('form_submit_data',allDataObject['form_submit_data'],true)
          }catch(e){
            console.log(e)
          }
        }
      }
    },10 * 1000);

    /* END INTERVAL */



    /* EVENT HANDLER */




    /* END EVENT HANDLER */


    /* TURBOLINKS */
    // debugger
    try{
      if(typeof Turbolinks !="undefined" && typeof Turbolinks == "object" && Turbolinks.supported==true){
        document.addEventListener('turbolinks:load', function(){
          console.log("TURBOLINK LOADED")
        });
        document.addEventListener('turbolinks:visit', function(){
          // Get Session value and compare old value.. If it different then save data
          var currentUTMParams = {};
          try{
            // Create visit id in every browser load
            // _this.setVisitIds('visitId',"visitId",_this.generateSecretKey(),options.visitExpire);
            // _this.getSessionData('view_change_data');
            var currentPageDetails = {
              l: encodeURIComponent(location.host+location.pathname),
              ts: (new Date()).getTime(),
              tt: document.title,
              sW: window.screen.width,
              sH: window.screen.height,
              p: (navigator.platform || null),
              referrer: encodeURIComponent(document.referrer),
              vsId: _this.visitorsId,
              vId: _this.visitId,
              cId: _this.cId,
              ev:'visit'
            };
            currentUTMParams = _this.getUTMParams();
            if(typeof currentUTMParams != "undefined" && Object.keys(currentUTMParams).length > 0){
              currentPageDetails['utm'] = currentUTMParams
            }
            allDataObject['view_change_data'] =[(currentPageDetails)];
            _this.setSessionData('view_change_data',allDataObject['view_change_data'],true);
          }catch(e){
            console.log(e)

          }
        });
        document.addEventListener('turbolinks:before-visit', function(){
          // This happend when after turbolink loaded and when user click link after that. Assume it won't work on initial page load
          // Send data to server
          _this.getSessionData('view_change_data');
          _this.sendPageViewData(_this.pageUrl)
        })
      }
    }catch(e){
      console.log(e) // Handle Turbolinks errors
    }

    /* END TURBOLINKS */

    /* HASH CHANGES FOR ANGULAR/REACT JS/EMBER AND OTHER CLIENT SIDE FRAMEWORKS */
    try{
      window.addEventListener('onhashchange', function(event){
        var oldUrl = event.oldURL || '';
        var newUrl = event.newURL || '';
        if(oldUrl && newUrl && oldUrl!=newUrl ){ //old page exist and are not equal
          // Send Data to Server and Save new Data

          _this.getSessionData();
          _this.sendPageViewData(_this.pageUrl)

          // Save new Data

          try{
            var currentPageDetails = {
              l: encodeURIComponent(newUrl),
              ts: (new Date()).getTime(),
              tt: document.title,
              sW: window.screen.width,
              sH: window.screen.height,
              p: (navigator.platform || null),
              referrer: encodeURIComponent(document.referrer),
              vsId: _this.visitorsId,
              vId: _this.visitId,
              cId: _this.cId,
              ev:'visit'
            };
            var currentUTMParams = _this.getUTMParams();
            if(typeof currentUTMParams != "undefined" && Object.keys(currentUTMParams).length > 0){
              currentPageDetails['utm'] = currentUTMParams
            }
            allDataObject['view_change_data'] =[(currentPageDetails)];
            _this.setSessionData('view_change_data',allDataObject['view_change_data'],true);
          }catch (e){
            console.log(e)
          }
        }
      })
    }catch (e){
      console.log("HASH CHANGE IS NOT SUPPORTED")
    }



    /* END */
  }


  function _removeDuplicates(originalArray, prop) {
    console.log(originalArray,prop)
    var newArray = [];
    var lookupObject  = {};
    for(var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }
    for(i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    console.log(newArray)
    return newArray;
  }

  function _matchRegeXAndReturnValue(input,callback){
    var name = input.name || null;
    var value = input.value || null;
    var firstCheck = [];
    if((/name/i).test(name)){
      firstCheck = (name).match(/name/i);
    }
    else if((/email/i).test(name)) {
      firstCheck = (name).match(/email/i);
    }else if((/company|organization/i).test(name)){
      firstCheck = (name).match(/company|organization/i)
    }
    if(firstCheck && firstCheck[0]){
      callback(firstCheck[0], value)
    }else{
      callback(null,null)
    }

  }

  function getCurrespondingGuessName(name) {
    "use strict";
    var currentGuess = false;
    switch (name) {
      case 'company':
      case 'organization':
        currentGuess = 'company';
        break;
      case 'last':
      case 'lname':
      case 'last_name':
      case 'lastName':
        currentGuess = 'lname';
        break;
      case 'first':
      case 'fname':
      case 'first_name':
      case 'firstName':
        currentGuess = 'fname';
        break;
      case 'fullname':
      case 'contact_name':
      case 'name':
        currentGuess = 'name';
        break;
      case 'middle':
      case 'mname':
        currentGuess = 'mname';
        break;
      case 'title':
      case 'role':
        currentGuess = 'title';
        break;
      case 'salutation':
      case 'greeting':
        currentGuess = 'salutation';
        break;
      case 'nick':
        currentGuess = 'nick';
        break;
      case 'email':
        currentGuess = 'email';
        break;
      case 'tel':
      case 'phone':
      case 'contact':
        currentGuess = 'phone';
        break;
      case 'address':
      case 'city':
      case 'town':
      case 'location':
        currentGuess = 'city';
        break;
      case 'employee':
      case 'team':
        currentGuess = 'team';
        break;
      case 'employer':
        currentGuess = 'employer';
        break;
      case 'birthday':
      case 'dob':
        currentGuess = 'dob';
        break;
      case 'fax':
        currentGuess = 'fax';
        break;
      case 'site':
      case 'link':
      case 'url':
        currentGuess = 'url';
        break;
      case 'postal':
      case 'zip':
      case 'code':
        currentGuess = 'zip';
        break;
      case 'country':
      case 'nation':
        currentGuess = 'nationality';
        break;
      case 'twitter':
        currentGuess = 'twitter';
        break;
      case 'facebook':
        currentGuess = 'facebook';
        break;
      case 'google':
        currentGuess = 'google';
        break;
      case 'linkedin':
        currentGuess = 'linkedin';
        break;
      default :
        currentGuess= null
    }
    return currentGuess;
  }

  /**
   *
   * @param message
   * @returns {*}
   * @refer https://github.com/emn178/js-sha256/blob/master/src/sha256.js
   * @detail https://github.com/emn178/js-sha256
   */
  function sha256(message) {
    try{

      if(typeof message == "undefined"){
        throw new Error("Please provide some string to convert")
      }
      var HEX_CHARS = '0123456789abcdef'.split('');
      var EXTRA = [-2147483648, 8388608, 32768, 128];
      var SHIFT = [24, 16, 8, 0];
      var K =[0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

      var blocks = [];


      var notString = typeof message != 'string';
      if (notString && message.constructor == root.ArrayBuffer) {
        message = new Uint8Array(message);
      }

      var h0, h1, h2, h3, h4, h5, h6, h7, block, code, first = true, end = false,
        i, j, index = 0, start = 0, bytes = 0, length = message.length,
        s0, s1, maj, t1, t2, ch, ab, da, cd, bc;


      h0 = 0x6a09e667;
      h1 = 0xbb67ae85;
      h2 = 0x3c6ef372;
      h3 = 0xa54ff53a;
      h4 = 0x510e527f;
      h5 = 0x9b05688c;
      h6 = 0x1f83d9ab;
      h7 = 0x5be0cd19;
      block = 0;
      do {
        blocks[0] = block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
            blocks[8] = blocks[9] = blocks[10] = blocks[11] =
              blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        if (notString) {
          for (i = start;index < length && i < 64;++index) {
            blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
          }
        } else {
          for (i = start;index < length && i < 64;++index) {
            code = message.charCodeAt(index);
            if (code < 0x80) {
              blocks[i >> 2] |= code << SHIFT[i++ & 3];
            } else if (code < 0x800) {
              blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
            } else if (code < 0xd800 || code >= 0xe000) {
              blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
            } else {
              code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
              blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
            }
          }
        }
        bytes += i - start;
        start = i - 64;
        if (index == length) {
          blocks[i >> 2] |= EXTRA[i & 3];
          ++index;
        }
        block = blocks[16];
        if (index > length && i < 56) {
          blocks[15] = bytes << 3;
          end = true;
        }

        var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (j = 16;j < 64;++j) {
          // rightrotate
          t1 = blocks[j - 15];
          s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
          t1 = blocks[j - 2];
          s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
          blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
        }

        bc = b & c;
        for (j = 0;j < 64;j += 4) {
          if (first) {
            ab = 704751109;
            t1 = blocks[0] - 210244248;
            h = t1 - 1521486534 << 0;
            d = t1 + 143694565 << 0;
            first = false;
          } else {
            s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            ab = a & b;
            maj = ab ^ (a & c) ^ bc;
            ch = (e & f) ^ (~e & g);
            t1 = h + s1 + ch + K[j] + blocks[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
          }
          s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
          s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
          da = d & a;
          maj = da ^ (d & b) ^ ab;
          ch = (h & e) ^ (~h & f);
          t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
          t2 = s0 + maj;
          g = c + t1 << 0;
          c = t1 + t2 << 0;
          s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
          s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
          cd = c & d;
          maj = cd ^ (c & a) ^ da;
          ch = (g & h) ^ (~g & e);
          t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
          t2 = s0 + maj;
          f = b + t1 << 0;
          b = t1 + t2 << 0;
          s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
          s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
          bc = b & c;
          maj = bc ^ (b & d) ^ cd;
          ch = (f & g) ^ (~f & h);
          t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
          t2 = s0 + maj;
          e = a + t1 << 0;
          a = t1 + t2 << 0;
        }

        h0 = h0 + a << 0;
        h1 = h1 + b << 0;
        h2 = h2 + c << 0;
        h3 = h3 + d << 0;
        h4 = h4 + e << 0;
        h5 = h5 + f << 0;
        h6 = h6 + g << 0;
        h7 = h7 + h << 0;
      } while (!end);

      var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
        HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
        HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
        HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
        HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
        HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
        HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
        HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
        HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
        HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
        HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
        HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
        HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
        HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
        HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
        HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
        HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
        HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
        HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
        HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
        HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
        HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
        HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
        HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
        HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
        HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
        HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
        HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];

      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];

      return hex;
    }catch(e){
      alert("SHA256 Errors"+e)
    }

  };
}catch(e){
  console.log(e)
}

