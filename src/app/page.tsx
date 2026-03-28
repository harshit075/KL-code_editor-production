import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-lg font-bold gradient-text">Kadel Labs Code Editor</span>
            </div>
            <Link href="/admin/login" className="btn-primary text-sm">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Online Coding Assessment Platform
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-slate-900">Evaluate Talent with</span>
              <br />
              <span className="gradient-text">Precision & Confidence</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create coding assessments, share unique test links, and evaluate candidates
              with real-time code execution and automated scoring.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/login" className="btn-primary text-base px-8 py-3">
                Get Started →
              </Link>
              <a href="#features" className="btn-secondary text-base px-8 py-3">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-slate-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything You Need</h2>
            <p className="mt-4 text-slate-600 text-lg">Powerful features for seamless coding assessments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '💻',
                title: 'Monaco Code Editor',
                desc: 'Industry-grade editor with syntax highlighting, autocomplete, and multi-language support.',
              },
              {
                icon: '🔒',
                title: 'Secure Execution',
                desc: 'Sandboxed code execution with Docker containers for maximum security.',
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                desc: 'Track candidate progress, scores, and completion rates in real-time.',
              },
              {
                icon: '🔗',
                title: 'Shareable Links',
                desc: 'Generate unique test links to share with candidates instantly.',
              },
              {
                icon: '🛡️',
                title: 'Anti-Cheating',
                desc: 'Tab switch detection, fullscreen enforcement, and activity monitoring.',
              },
              {
                icon: '⚡',
                title: 'Auto Evaluation',
                desc: 'Automated test case validation with instant pass/fail results.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 hover:scale-[1.02] transition-smooth group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-300 transition-smooth">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Kadel Labs. Built for excellence in coding assessment.
          </p>
        </div>
      </footer>
    </div>
  );
}
