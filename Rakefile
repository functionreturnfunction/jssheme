namespace :run do
  desc 'Run the interpreter in Google Chrome (this has only been shown to work on UNIX systems)'
  task :chrome do
    `google-chrome content/scheme.htm`
  end
end

task :run => 'run:chrome'

namespace :test do
  desc 'Run the tests in Mozilla Rhino (rhino must be installed and available from the current $PATH for this to work)'
  task :rhino do
    puts `rhino test/rhinoTest.js`
  end

  task :node do
    puts `node test/rhinoTest.js`
  end

  desc 'Run the interpreter in Google Chrome (this has only been shown to work on UNIX systems)'
  task :chrome => 'run:chrome'
end

task :test => 'test:rhino'
