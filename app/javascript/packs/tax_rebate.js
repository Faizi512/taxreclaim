import Common from "./common.js"

class TaxRebate extends Common {
  constructor() {
    super();
    this.tax = 0
    this.currentTab = 0;
    this.details = {};
    this.getFormDetails('#dealform')
    this.showTab(this.currentTab);
    var CI = this;
    var current_fs, next_fs, previous_fs;
    CI.calculateTax()
    CI.getUserDetails()
    CI.startCarousel()

    $(".scroll-to-form").click(function() {
      $('html, body').animate({
        scrollTop: $("#form-banner").offset().top
      }, 300);
    });

    window.Parsley.on('field:error', function() {
      $(".btn-success").removeClass("in-progress")
      $(".tab").removeClass("in-progress")
    });

    // Next button
    $(".next-button").click(function(){
      if (CI.getFieldsStatus()) {
        $(".missing-data").show();
      }else{
        current_fs = $(this).parent().parent();
        next_fs = $(this).parent().parent().next();
        CI.nextStep(current_fs, next_fs)
      }
    });

    $(".continueBtn").click(function(){
      current_fs = $(this).parent().parent();
      next_fs = $(this).parent().parent().next();
      CI.nextStep(current_fs, next_fs)
    });

    // Previous button
    $(".prev").click(function(){
      CI.currentTab = CI.currentTab - 2
      current_fs = $(this).parent().parent();
      previous_fs = $(this).parent().parent().prev();
      $(current_fs).removeClass("show");
      $(previous_fs).prev().addClass("show");
      $(".prev").css({ 'display' : 'block' });
      if($(".show").hasClass("first-screen")) {
        $(".prev").css({ 'display' : 'none' });
      }
      $("#progressbr li").eq($(".card2").index(current_fs)).removeClass("active");
      $("#progressbr li").eq($(".card2").index(previous_fs)).removeClass("active");
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

  startCarousel(){
    $( document ).ready(function() {
      var options = {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        wrapAround: true,
        autoPlay: 2500
      }
      new Flickity( document.querySelector('.newspaper-carousel'), options);
      new Flickity( document.querySelector('.reviews-carousel'), options);
    });
  }

  getFieldsStatus(){
    var CI = this;
    var status = CI.getUrlParameter("income_type") == undefined ||  CI.getUrlParameter("income_type") == '' || CI.getUrlParameter("incomenetmonthly") == undefined || CI.getUrlParameter("incomenetmonthly") == '' || CI.getUrlParameter("worktimeatemployer") == undefined || CI.getUrlParameter("worktimeatemployer") == ''
    return status
  }

  getUserDetails(){
    $('.employment-status').text(this.getUrlParameter("income_type") || "Unknown");
    $('.monthly-salary').text(this.getUrlParameter("incomenetmonthly") || "Unknown");
    $('.yearly-salary').text(this.getUrlParameter("worktimeatemployer") || "Unknown");
    $('.work-industry').text(this.getUrlParameter("workindustry") || "Unknown")
  }

  calculateTax() {
    var CI = this
    var employmentStatus =  this.getUrlParameter('income_type');
    if (employmentStatus != undefined && employmentStatus != "") {
      employmentStatus = employmentStatus.toLowerCase().replace(/[^a-zA-Z,]/g, "")
    }

    var employmentYears = parseInt(this.getUrlParameter('worktimeatemployer') || "")
    var monthlyIncome = parseInt(this.getUrlParameter('incomenetmonthly') || "")
    var results = 0;
    if (employmentStatus == "selfemployed"){
      results = 4 * 3100    // employmentYears = 4 static value cause of charles requirement
    }
    else if (employmentStatus == "fulltimeemployment" || employmentStatus == "fulltime" || employmentStatus == "parttime" || employmentStatus == "parttimeemployment" || employmentStatus == "temporaryemployment") {
      results = (((monthlyIncome * 12) / 5000) * 100) * 4     // employmentYears = 4 static value cause of charles requirement
    }

    CI.tax = CI.numberWithCommas(results)
    $('.tax-estimate').text(CI.tax);
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}

export default new TaxRebate();

