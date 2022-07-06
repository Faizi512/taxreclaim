class PagesController < ApplicationController
	include PagesHelper
	skip_before_action :verify_authenticity_token


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
	def upload
		bucket_name = ENV['bucket_name']
		object_key = params[:file].tempfile
		region = 'eu-west-2'
		s3_client = Aws::S3::Client.new(
		  access_key_id: ENV['access_key_id'],
		  secret_access_key: ENV['secret_access_key'],
		  region: region
		)
	
		if object_uploaded?(s3_client, bucket_name, object_key)
		  puts "Object '#{object_key}' uploaded to bucket '#{params[:name]}'."
		  render json: {response: {url: "#{ENV['bucket_base_url']}/#{params[:name]}.jpeg"}}
		else
		  puts "Object '#{object_key}' not uploaded to bucket #{params[:name]}'."
		  render json: {response: {url: "Failed to upload URL due to AWS Down", status: 404}}
		end
	end
	
	  def object_uploaded?(s3_client, bucket_name, object_key)
		response = s3_client.put_object(
		  bucket: bucket_name,
		  key: "#{params[:name]}.jpeg",
		  body: object_key,
		  content_encoding: 'image/jpeg',
		  content_type: "image/jpeg",
		  acl: 'public-read',
		  content_disposition: "inline"
		)
	
		if response.etag
		  return true
		else
		  return false
		end
	  rescue StandardError => e
		puts "Error uploading object: #{e.message}"
		return false
	  end
	
	

end
