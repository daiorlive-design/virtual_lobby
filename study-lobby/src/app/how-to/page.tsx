import Link from 'next/link'

export default function HowToPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-teal text-sm font-display font-bold mb-8 block hover:underline">
          ← Back to Lobby
        </Link>

        <h1 className="font-display font-bold text-3xl text-navy mb-2">How to Use the Lobby</h1>
        <p className="text-gray-500 mb-8">Welcome! Here's everything you need to get started.</p>

        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Enter your name',
              desc: 'No account needed — just type your name on the home screen and click Enter the Lobby.',
            },
            {
              step: '2',
              title: 'Set your status',
              desc: 'At the top of the lobby, type what you\'re studying (e.g. "Solving calc problems"). Everyone can see it!',
            },
            {
              step: '3',
              title: 'Join a room',
              desc: 'Pick the Silent Study Zone (no talking, pure focus) or the Brainstorm Room (collaborate and discuss).',
            },
            {
              step: '4',
              title: 'Start your Pomodoro',
              desc: 'Once inside a room, your timer appears. Hit Start to begin. When it ends, your minutes are saved to the leaderboard.',
            },
            {
              step: '5',
              title: 'Post your study plan',
              desc: 'In the Study Plans tab, share what you\'re working on this session. It helps everyone stay accountable.',
            },
            {
              step: '6',
              title: 'Check the leaderboard',
              desc: 'See who studied the most today. It resets every day at midnight — keep building your streak!',
            },
          ].map(item => (
            <div key={item.step} className="bg-white rounded-2xl p-5 flex gap-4 border border-black/5">
              <div className="w-9 h-9 rounded-full bg-navy text-white font-display font-bold text-base flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-display font-bold text-navy text-base mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-mint rounded-2xl p-5">
          <h3 className="font-display font-bold text-navy text-base mb-2">Before you start studying</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {['Grab water & a snack', 'Put your phone on silent', 'Organize your desk space', 'Set your status in the lobby', 'Post your plan for this session'].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-teal">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="bg-navy text-white font-display font-bold py-3 px-8 rounded-xl hover:bg-teal transition-colors inline-block"
          >
            Enter the Lobby →
          </Link>
        </div>
      </div>
    </main>
  )
}
