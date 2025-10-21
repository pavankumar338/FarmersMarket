import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navigation with backdrop blur */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-green-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🌾</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              FarmFresh Direct
            </span>
          </div>
          <div className="flex space-x-8 items-center">
            <a href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Home</a>
            <a href="/auth/signin" className="text-green-700 font-semibold hover:text-green-800 transition-colors">Sign In</a>
            <a 
              href="/auth/register" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section with enhanced gradient and animations */}
      <section className="container mx-auto px-6 py-24 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10">
          <div className="inline-block mb-6">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
              🌟 Farm to Table Excellence
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Fresh From Farm to
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Your Institution
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect directly with local farmers and get farm-fresh produce delivered to your college, school, or apartment community. 
            <span className="font-semibold text-green-700"> No middlemen</span>, just quality products at fair prices.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/auth/register" 
              className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Register Your Organization</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section with cards */}
      <section className="bg-white/50 backdrop-blur-sm py-20 border-y border-green-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FarmFresh Direct?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🌱", title: "Farm Fresh Quality", desc: "Get the freshest produce directly from local farmers. No storage delays, just pure freshness.", color: "from-green-500 to-emerald-500" },
              { icon: "💰", title: "Fair Pricing", desc: "Cut out the middlemen and get better prices while ensuring farmers receive fair compensation.", color: "from-emerald-500 to-teal-500" },
              { icon: "🚚", title: "Reliable Delivery", desc: "Schedule regular deliveries to your institution. Weekly, bi-weekly, or custom schedules available.", color: "from-teal-500 to-cyan-500" }
            ].map((benefit, idx) => (
              <div 
                key={idx}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`text-6xl mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br ${benefit.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories with hover effects */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Product Categories
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: "Fruits", icon: "🍎", desc: "Fresh seasonal fruits", gradient: "from-red-500 to-orange-500" },
            { name: "Vegetables", icon: "🥕", desc: "Organic vegetables", gradient: "from-orange-500 to-green-500" },
            { name: "Grains", icon: "🌾", desc: "Quality grains & pulses", gradient: "from-amber-500 to-yellow-500" },
            { name: "Dairy", icon: "🥛", desc: "Farm-fresh dairy products", gradient: "from-blue-400 to-cyan-400" }
          ].map((category) => (
            <a 
              key={category.name}
              href="/products"
              className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Sustainability Section with gradient background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 shadow-sm">
              🌍 Our Impact
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Committed to Sustainability & Farmer Empowerment
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            We believe in supporting local farmers, reducing food miles, and promoting sustainable agriculture. 
            Every purchase you make helps strengthen local farming communities and ensures fresher, healthier food for everyone.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: "100+", label: "Partner Farmers", icon: "👨‍🌾" },
              { number: "50+", label: "Organizations Served", icon: "🏢" },
              { number: "10k+", label: "Fresh Deliveries", icon: "📦" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-green-100 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced design */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-green-50 mb-10">
              Join hundreds of institutions already enjoying farm-fresh produce
            </p>
            <a 
              href="/auth/register" 
              className="group bg-white text-green-600 px-10 py-4 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Register Your Organization Now</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 border-t border-gray-700">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">🌾</span>
                <span className="text-xl font-bold">FarmFresh Direct</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting farmers with institutions for a sustainable future.
              </p>
            </div>
            <div></div>
            <div>
              <h4 className="font-bold mb-4 text-lg">For Organizations</h4>
              <ul className="space-y-3">
                <li><a href="/auth/register" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><span>→</span><span>Register</span></a></li>
                <li><a href="/auth/signin" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><span>→</span><span>Sign In</span></a></li>
                <li><a href="/bulk-orders" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><span>→</span><span>Bulk Orders</span></a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">For Farmers</h4>
              <ul className="space-y-3">
                <li><a href="/farmer/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><span>→</span><span>Farmer Dashboard</span></a></li>
                <li><a href="/auth/signin" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><span>→</span><span>Sign In</span></a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 FarmFresh Direct. All rights reserved. Made with 💚 for farmers and communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}