module PagesHelper
	def tax_rebate_helper
    @details = {
      camp_id: 'TAX',
      success_url: '',
      form_name: 'Switch-Mobile',
      optin_url: 'https://uktaxreclaim.com/tax-rebate',
      sid: nil,
      ssid: nil,
      source: "LOAN-2",
      ipaddress: request.remote_ip,
    }.to_json
	 end
   def home
     @details = {
      camp_id: 'TAX',
      success_url: '',
      form_name: 'home',
      optin_url: 'https://uktaxreclaim.com/',
      sid: nil,
      ssid: nil,
      source: "",
      ipaddress: request.remote_ip,
    }.to_json
   end

end
