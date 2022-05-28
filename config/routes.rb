Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root to: "pages#index"
  get '/paye', to: 'pages#paye'
  get '/tax-rebate-v2', to: 'pages#tax_rebate_v2'
  get '/paye-rebate', to: 'pages#paye_rebate'
  get '/tax-rebate', to: 'pages#tax_rebate'
  get '/app', to: 'pages#app'
end
