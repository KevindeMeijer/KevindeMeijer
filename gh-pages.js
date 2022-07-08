var ghpages = require('gh-pages');

ghpages.publish(
  'public',
  {
    branch: 'gh-pages',
    repo: 'https://github.com/KevindeMeijer/KevindeMeijer.git',
    user: {
      name: 'Kevin de Meijer',
      email: 'kevin.demeijer@student.hu.nl',
    }
  },
  () => {
    console.log('Deployed!');
  }
)