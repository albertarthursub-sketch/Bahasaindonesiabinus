import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📚 Bahasa Learning
          </h1>
          <p className="text-xl text-gray-600">
            Grades 1-2 • Early Literacy & Basic Vocabulary
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Link to="/teacher-login">
              <div className="card hover:shadow-xl transition-all cursor-pointer border-4 border-transparent hover:border-blue-400 mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">👩‍🏫</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    For Teachers
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Create vocabulary lists, import students, and track progress
                  </p>
                  <div className="text-sm text-gray-500">
                    ✓ Email OTP Login<br/>
                    ✓ Import student names<br/>
                    ✓ Auto-generate codes
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/teacher-signup">
              <button className="w-full btn bg-green-500 hover:bg-green-600 text-white">
                Create New Account →
              </button>
            </Link>
          </div>

          <Link to="/student">
            <div className="card hover:shadow-xl transition-all cursor-pointer border-4 border-transparent hover:border-green-400">
              <div className="text-center">
                <div className="text-6xl mb-4">👦</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  For Students
                </h2>
                <p className="text-gray-600 mb-4">
                  Learn vocabulary with drag-and-drop fun!
                </p>
                <div className="text-sm text-gray-500">
                  ✓ Enter your code<br/>
                  ✓ Drag syllables<br/>
                  ✓ Earn stars
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link to="/setup">
            <button className="btn btn-gray">
              🔧 Firebase Setup (Run this first!)
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
