namespace :run do
  task :chrome do
    `google-chrome content/scheme.htm`
  end
end

task :run => 'run:chrome'

namespace :test do
  task :rhino do
    puts `rhino test/rhinoTest.js`
  end

  task :node do
    puts `node test/rhinoTest.js`
  end

  task :chrome => 'run:chrome'
end

task :test => 'test:rhino'
