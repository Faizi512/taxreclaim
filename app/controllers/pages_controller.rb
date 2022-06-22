class PagesController < ApplicationController
	include PagesHelper

	def index
		home
	end

	def tax_rebate
		tax_rebate_helper
	end

	def paye_rebate
	end

	def paye
	end

	def new_claim
		new_claim_helper
	end

end
