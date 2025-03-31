
const AboutDev = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">About <span className="text-blue-600">Developer</span></h2>

        <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg border-4 border-white">
            <img
              src="./pj_ghibli.png"
              alt="Developer profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Purushotam Jeswani</h3>
            <p className="text-blue-600 font-medium mb-4">Full Stack Developer</p>
            <p className="text-gray-700 leading-relaxed">
              I love building things that work fast and scale well. Whether it's designing sleek UIs with React or setting up backends on AWS, I enjoy making tech simple and efficient. Lately, I’ve been diving into DevOps—automating workflows, optimizing deployments, and keeping things running smoothly in the cloud. Outside of coding, I’m into geopolitics, reading, and exploring new places. Always curious, always building.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'JavaScript', 'TypeScript', 'Golang', 'MongoDB', 'Express', 'HTML/CSS', 'Git', 'RESTful APIs', 'Recoil', 'Docker', 'Aws', 'Cloudflare'].map((skill) => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Other Projects</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Kanban Application</p>
                <p className="text-sm text-gray-600 space-x-2">
                  <a className="text-blue-600 font-semibold inline hover:underline" href="https://kanbantodo.purushotamjeswani.in" target="_blank">Link</a>
                  <a className="text-blue-600 font-semibold inline hover:underline" href="https://github.com/MrPurushotam/kanban-todo" target="_blank">Github</a>
                </p>
              </div>
              <div>
                <p className="font-medium">Adaptive Bitrate Streaming</p>
                <p className="text-sm text-gray-600">
                  <a className="text-blue-600 font-semibold inline hover:underline" href="https://github.com/MrPurushotam/content-streaming" target="_blank">Github</a>
                </p>

              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">About This Project</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            This chat application was built using React for the frontend and Node.js with Express for the backend.
            It features real-time messaging using Socket.IO, user authentication, and responsive design.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The project demonstrates my ability to create full-stack applications with modern
            technologies and real-time capabilities. Feel free to explore the code and functionality!
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <a href="https://github.com/MrPurushotam" target='_blank' className="text-gray-700 hover:text-blue-600 transition-colors">
            <i className="ph-duotone ph-github-logo text-2xl"></i>
          </a>
          <a href="https://linkedin.com/in/purushotamjeswani" target='_blank' className="text-gray-700 hover:text-blue-600 transition-colors">
            <i className="ph-duotone ph-linkedin-logo text-2xl"></i>
          </a>
          <a href="https://twitter.com/purushotam___j" target='_blank' className="text-gray-700 hover:text-blue-600 transition-colors">
            <i className="ph-duotone ph-x-logo text-2xl"></i>
          </a>
        </div>
      </div>
    </div >
  )
}

export default AboutDev 