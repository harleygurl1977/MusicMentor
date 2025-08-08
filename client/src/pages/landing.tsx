import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen garden-gradient-bg flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <Card className="glass-effect border-0 shadow-2xl">
          <CardContent className="p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-garden-green to-garden-green-dark rounded-2xl mr-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-800 mb-2">GardenAI</h1>
                <p className="text-xl text-gray-600">Your Smart Gardening Companion</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Transform your gardening experience with AI-powered tips, plant tracking, 
              and personalized care recommendations. Join thousands of gardeners growing smarter, not harder.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 bg-garden-green/10 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-garden-green text-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Tips</h3>
                <p className="text-gray-600 text-sm">Get personalized gardening advice based on your plants, location, and weather conditions.</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Plant Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor your plants' health, track watering schedules, and never miss important care tasks.</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 text-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Calendar</h3>
                <p className="text-gray-600 text-sm">Plan your garden activities with an intelligent calendar that adapts to seasons and weather.</p>
              </div>
            </div>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-garden-green to-garden-green-dark hover:shadow-lg transition-all duration-300 text-lg px-8 py-6"
              onClick={() => {
                window.location.href = "/api/login";
              }}
              data-testid="button-login"
            >
              Start Gardening Smarter
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Free to start • No credit card required • Join our growing community
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
