import Common from "./common.js"

class Home extends Common {
  constructor() {
    super();
    this.tax = 0
    this.currentTab = 0;
    this.details = {};
    this.validate('#dealform')
    this.getFormDetails('#dealform')
    this.showTab(this.currentTab);
    var CI = this;
    var current_fs, next_fs, previous_fs;
    CI.getUserDetails()

    $(".scroll-to-form").click(function() {
      $('html, body').animate({
        scrollTop: $("#homepage").offset().top
      }, 300);
    });

    window.Parsley.on('field:error', function() {
      $(".btn-success").removeClass("in-progress")
      $(".tab").removeClass("in-progress")
    });

    $( ".employment-status" ).change(function() {
      var employmentStatus = $( "#employment-status option:selected" ).val()
      if (employmentStatus == "full_time_employment" || employmentStatus == "temporary_employment" || employmentStatus == "part_time_employment") {
        if ($( ".day-rate-div" ).hasClass("d-none")) {
        }else{
          $( ".day-rate-div" ).addClass("d-none");
        }
        $( ".monthly-salary-div" ).removeClass("d-none");
        $( ".day-rate" ).parsley().destroy();
        $( ".monthly-salary" ).attr('data-parsley-required', 'true');
        $( ".year-employment-div" ).show();
        $( ".employed-title" ).show();
        $( ".self-employed-title" ).hide();
        $( ".workIndustry-div" ).show();
        $( ".next-button" ).prop("enabled",true);
        $( ".unemployed-div" ).hide();
      }else if ( employmentStatus == "self_employed") {
        if ($( ".monthly-salary-div" ).hasClass("d-none")) {

        }else{
          $( ".monthly-salary-div" ).addClass("d-none");
        }
        $( ".workIndustry-div" ).show();
        $( ".day-rate-div" ).removeClass("d-none");
        $( ".day-rate" ).parsley();
        $( ".day-rate" ).attr('data-parsley-required', 'true');
        $( ".monthly-salary" ).parsley().destroy();
        $( ".year-employment-div" ).show();
        $( ".employed-title" ).hide();
        $( ".self-employed-title" ).show();
        $( ".next-button" ).prop("enabled",true);
        $( ".unemployed-div" ).hide();
      }else{
        $( ".workIndustry-div" ).hide();
        $( ".year-employment-div" ).hide();
        $( ".unemployed-div" ).show();
        $( ".next-button" ).prop("disabled",true);
        if ($( ".day-rate-div" ).hasClass("d-none")) {

        }else{
          $( ".day-rate-div" ).addClass("d-none");
        }
        if ($( ".monthly-salary-div" ).hasClass("d-none")) {

        }else{
          $( ".monthly-salary-div" ).addClass("d-none");
        }
      }
    });

    // Next button
    $(".next-button").click(function(){
      current_fs = $(this).parent().parent();
      next_fs = $(this).parent().parent().next();
      CI.calculateTax()
      $('#dealform').parsley().whenValidate({
        group: 'block-0'
      }).done(() =>{
        CI.nextStep(current_fs, next_fs)
      })
    });

    $(".continueBtn").click(function(){
      current_fs = $(this).parent().parent();
      next_fs = $(this).parent().parent().next();
      $('#dealform').parsley().whenValidate({
        group: 'block-1'
      }).done(() =>{
        CI.nextStep(current_fs, next_fs)
      })
    });

    $(".continueBtn2").click(function(){
      current_fs = $(this).parent().parent();
      next_fs = $(this).parent().parent().next();
      // $('#dealform').parsley().whenValidate({
        // group: 'block-2'
      // }).done(() =>{
        CI.nextStep(current_fs, next_fs)
      // })
    });

    // Previous button
    $(".prev").click(function(){
      current_fs = $(this).parent().parent();
      previous_fs = $(this).parent().parent().prev();
      if (CI.currentTab == 2) {
        CI.currentTab = CI.currentTab - 2
        $(previous_fs).prev().addClass("show");
      }else{
        CI.currentTab = CI.currentTab - 1
        $(previous_fs).addClass("show");
      }
      $(current_fs).removeClass("show");
      $(".prev").css({ 'display' : 'block' });
      if($(".show").hasClass("first-screen")) {
        $(".prev").css({ 'display' : 'none' });
      }
      if (CI.currentTab == 0) {
        $("#progressbr li").eq($(".card2").index(current_fs)).removeClass("active");
        $("#progressbr li").eq($(".card2").index(previous_fs)).removeClass("active");
      }else{
        $("#progressbr li").eq($(".card2").index(current_fs)).removeClass("active");
      }
      current_fs.animate({}, {
        step: function() {
          current_fs.css({
            'display': 'none',
            'position': 'relative'
          });
          previous_fs.prev().css({
            'display': 'block'
          });
        }
      });
    });
  }

  nextStep(current_fs, next_fs) {
    var CI = this
    CI.currentTab = CI.currentTab+1;
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
    if (CI.currentTab == 1) {
      setTimeout(function(){
        CI.nextStep(next_fs, next_fs.next())
      }, 2500);
    }
    if (CI.currentTab == 5) {
      $("#progressbr li:nth-child(8)").addClass("active")
      CI.postData()
      return true
    }
  }

  getFieldsStatus(){
    var CI = this;
    var status = CI.getUrlParameter("income_type") == undefined ||  CI.getUrlParameter("income_type") == '' || CI.getUrlParameter("incomenetmonthly") == undefined || CI.getUrlParameter("incomenetmonthly") == '' || CI.getUrlParameter("worktimeatemployer") == undefined || CI.getUrlParameter("worktimeatemployer") == ''
    return status
  }

  getUserDetails(){
    $("#employment-status").val(this.getUrlParameter('income_type')).change();
    $(".year-employment").val(this.getUrlParameter('worktimeatemployer'));
    $("#day-rate").val(this.getUrlParameter('day_rate'));
    $("#monthly-salary").val(this.getUrlParameter('incomenetmonthly'));
  }

  calculateTax() {
    var CI = this
    var employmentStatus = $( "#employment-status option:selected" ).val() || this.getUrlParameter('income_type') || "";
    if (employmentStatus != undefined && employmentStatus != "") {
      employmentStatus = employmentStatus.toLowerCase().replace(/[^a-zA-Z,]/g, "")
    }

    var employmentYears = $(".year-employment").val() || parseInt(this.getUrlParameter('worktimeatemployer') || "")
    employmentYears =  employmentYears > 4 ? 4 : employmentYears
    var day_rate_monthly = $("#day-rate").val() || "";
    day_rate_monthly = day_rate_monthly*21
    var monthlyIncome = $("#monthly-salary").val() || day_rate_monthly || parseInt(this.getUrlParameter('incomenetmonthly') || "")

    var results = 0;
    if (employmentStatus == "selfemployed"){
      results = employmentYears * 3100
    }
    else if (employmentStatus == "fulltimeemployment"  || employmentStatus == "fulltime" || employmentStatus == "parttimeemployment" || employmentStatus == "parttime" || employmentStatus == "temporaryemployment") {
      results = (((monthlyIncome*12) / 5000) * 100) * employmentYears
    }

    CI.tax = CI.numberWithCommas(results)
    CI.tax = CI.tax.replace(/,/gi, '');
    CI.tax = Math.round(CI.tax);
    $('.tax-estimate').text(CI.tax);
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}

export default new Home();
