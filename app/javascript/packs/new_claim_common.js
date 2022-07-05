import 'parsleyjs/dist/parsley.min.js';

class Common {
  constructor() {
    var CI = this;
    this.formValidation = {}
    this.currentTab = 0;
    this.details = {};
    this.repairOption = ""
    this.getFormDetails("#dealform");
  }

  getFormDetails(form){
    this.details = $(form).data( "details")
  }

  popupTerms(){
    $( ".close" ).click(function() {
      $('.modal').hide();
    });
  }

  validate(){
    this.formValidation = $('#dealform').parsley({
      trigger: "focusout",
      errorClass: 'error',
      successClass: 'valid',
      errorsWrapper: '<div class="parsley-error-list"></div>',
      errorTemplate: '<label class="error"></label>',
      errorsContainer (field) {
        if(field.$element.hasClass('approve')){
          return $('.error-checkbox')
        }
        if(field.$element.hasClass('error-on-button')){
          return $(field.element.closest(".tab").querySelector(".error-box"))
        }
        return field.$element.parent()
      },
    })
    this.validateEmail()
    this.validatePhone()
    this.validateApiPostcode()
  }

  validateApiPostcode(){
    window.Parsley.addValidator('validapipostcode', {
      validateString: function(value){
        return $.ajax({
          url:`https://api.getAddress.io/find/${$(".postcode1").val()}?api-key=NjGHtzEyk0eZ1VfXCKpWIw25787&expand=true`,
          success: function(json){
            $(".property-div").show()
            if (json.addresses.length > 0) {
              var result = json.addresses
              var adresses = []
               adresses.push( `
                <option
                disabled=""
                selected=""
                >
                Select Your Property
                </option>
              `)
              for (var i = 0; i < result.length; i++) {
                adresses.push( `
                    <option
                    data-street="${result[i].line_1 || result[i].thoroughfare}"
                    data-city="${result[i].town_or_city}"
                    data-address="${result[i].formatted_address.toString().replaceAll(',', ' ')}"
                    data-province="${result[i].county || result[i].town_or_city}"
                    data-street2="${result[i].line_2}"
                    data-building="${result[i].building_number || result[i].sub_building_number || result[i].building_name || result[i].sub_building_name}"
                    >
                    ${result[i].formatted_address.join(" ").replace(/\s+/g,' ')}
                    </option>
                  `)
                }
                $('#property').html(adresses)
                $(".address-div").remove();
              return true
            }else{
              $(".step").removeClass("in-progress")
              return $.Deferred().reject("Please Enter Valid Postcode 2");
            }
          },
          error: function(request){
            console.log(request.statusText)
            request.abort();
            if (request.statusText == "timeout") {
              $(".property-div").remove();
            }
          },
          timeout: 5000
        })
      },
      messages: {
         en: 'Please Enter Valid Postcode',
      }
    });
  }

  validateEmail(){
    var CI = this
    window.Parsley.addValidator('validemail', {
      validateString: function(value){
        var xhr = $.ajax('https://go.webformsubmit.com/dukeleads/restapi/v1.2/validate/email?key=50f64816a3eda24ab9ecf6c265cae858&value='+$('.email').val())
        return xhr.then(function(json) {
          if (json.status == "Valid") {
            CI.isEmail = true
            return true
          }else if(json.status == "Invalid"){
            return $.Deferred().reject("Please Enter Valid Email Address");
          }else{
            CI.isEmail = true
            return true
          }
        }).catch(function(e) {
          if (e == "Please Enter Valid Email Address") {
            return $.Deferred().reject("Please Enter Valid Email Address")
          }else{
            CI.isEmail = true
            return true
          }
        });
      },
      messages: {
         en: 'Please Enter Valid Email Address',
      }
    });
  }

  validatePhone(){
    var CI = this
    window.Parsley.addValidator('validphone', {
      validateString: function(value){
        var xhr = $.ajax('https://go.webformsubmit.com/dukeleads/restapi/v1.2/validate/mobile?key=50f64816a3eda24ab9ecf6c265cae858&value='+$('.phone').val())
        return xhr.then(function(json) {
          var skipresponse = ["EC_ABSENT_SUBSCRIBER", "EC_ABSENT_SUBSCRIBER_SM", "EC_CALL_BARRED", "EC_SYSTEM_FAILURE","EC_SM_DF_memoryCapacityExceeded", "EC_NO_RESPONSE", "EC_NNR_noTranslationForThisSpecificAddress", "EC_NNR_MTPfailure", "EC_NNR_networkCongestion"]
          if (skipresponse.includes(json.response) && json.status == "Valid" ) {
            CI.isPhone = true
            $(".global-phone-success").addClass("d-inline-block")
            return true
          }
          else if (json.status == "Valid") {
            $(".global-phone-success").addClass("d-inline-block")
            CI.isPhone = true
            return true
          }else if(json.status == "Invalid"){
            $(".global-phone-success").removeClass("d-inline-block")
            return $.Deferred().reject(`Please Enter Valid Phone Number`);
          }else if(json.status == "Error"){
            return $.Deferred().reject(`Please Enter Valid Phone Number`);
          }else{
            CI.isPhone = true
            return true
          }
        }).catch(function(e) {
          if (e == `Please Enter Valid Phone Number`) {
            return $.Deferred().reject(`Please Enter Valid Phone Number`)
          }else{
            CI.isPhone = true
            $(".global-phone-success").addClass("d-inline-block")
            return true
          }
        });
      },
      messages: {
         en: `Please Enter Valid Phone Number` ,
      }
    });
  }

  showTab(n=0) {
    var tabs = $(".tab");
    if (!tabs[n]) return;
    tabs[n].style.display = "block";
    $(".tab").removeClass("in-progress")
  }

  nextStep(current_fs, next_fs) {
    var CI = this
    // $(".prev").css({ 'display' : 'block' });
    $(current_fs).removeClass("show");
    $(next_fs).addClass("show");
    $("#progressbr li").eq($(".card2").index(next_fs)).addClass("active");
    current_fs.animate({}, {
      step: function() {
        current_fs.css({
          'display': 'none',
          'position': 'relative'
        });
        next_fs.css({
          'display': 'block'
        });
      }
    });

    CI.currentTab += 1

    if (CI.currentTab == 1) {
      setTimeout(function(){
        CI.nextStep(next_fs, next_fs.next())
      }, 2500);
    }
    if (CI.currentTab == 7) {
      CI.postData()
      return true
    }
  }

  getData() {
    var day_rate_monthly = $("#day-rate").val() || "";
    day_rate_monthly = day_rate_monthly*21
    return {
      q1:  $( "#question1 option:selected" ).val() || this.getUrlParameter("q1") || "",
      q2:  $( "#question2 option:selected" ).val() || this.getUrlParameter("q2") || "",
      q3:  $( "#question3 option:selected" ).val() || this.getUrlParameter("q3") || "",
      q4:  $( "#question4 option:selected" ).val() || this.getUrlParameter("q4") || "",
      q5:  $( "#question5 option:selected" ).val() || this.getUrlParameter("q5") || "",
      q6:  $( "#question6 option:selected" ).val() || this.getUrlParameter("q6") || "",
      income_type:  $( "#employment-status option:selected" ).val() || this.getUrlParameter("income_type") || "",
      residentialstatus:  this.getUrlParameter("residentialstatus") || "",
      incomeNetMonthly: $("#monthly-salary").val() || day_rate_monthly ||  this.getUrlParameter("incomenetmonthly") || "",
      workTimeAtEmployer: $(".year-employment").val() || this.getUrlParameter("worktimeatemployer") || "",
      workIndustry: $( "#workIndustry option:selected" ).val() || this.getUrlParameter("workindustry") || "",
      loanPurpose:  this.getUrlParameter("loanpurpose"),
      firstname: $(".first_name").val() || this.getUrlParameter('firstname') || '',
      lastname: $(".last_name").val() || this.getUrlParameter('lastname') || '',
      email: $(".email").val() || this.getUrlParameter('email') || '',
      phone1: $(".phone").val() || this.getUrlParameter('phone1') || '',
      partner_first_name: $("#partner_first_name").val() || "",
      partner_last_name: $("#partner_last_name").val() || "",
      partner_dob: $("#partner_dob").val() || "",
      nic: $("#national").val() || "",
      signature: $("#sig-dataUrl").val() || "",
      ipaddress: this.details.ipaddress || '',
      source: this.getUrlParameter('source') || this.details.source || '',
      sid: this.getUrlParameter('sid') || 1
    };
  }

  firePixel(){
    window.dataLayer = window.dataLayer || [];
    dataLayer.push({'event': 'transaction'})
  }

  postData() {
    // Getting Data
    var CI = this;
    var data = this.getData();
    // Form Submisson
    this.submitLead(data, this.details.camp_id)
    CI.firePixel();
  }

  successUrl(){
    return "/success"
  }

  submitLead(formData, campid){
    var CI = this
    $.ajax({
      type: "POST",
      url: "https://go.webformsubmit.com/dukeleads/waitsubmit?key=eecf9b6b61edd9e66ca0f7735dfa033a&campid=" + campid,
      data: formData,
      success: function(data) {

      },
      error: function(request){
        console.log(request.statusText)
        CI.successUrl()
      },
      dataType: "json"
    })
  }

  getFormattedCurrentDate() {
    var date = new Date();
    var day = this.addZero(date.getDate());
    var monthIndex = this.addZero(date.getMonth() + 1);
    var year = date.getFullYear();
    var min = this.addZero(date.getMinutes());
    var hr = this.addZero(date.getHours());
    var ss = this.addZero(date.getSeconds());

    return day + '/' + monthIndex + '/' + year + ' ' + hr + ':' + min + ':' + ss;
  }

  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  }

}

export default Common;
