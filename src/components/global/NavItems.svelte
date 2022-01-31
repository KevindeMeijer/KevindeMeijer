<div class="navwrapper">
  <nav class="brackets">
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#work">Work</a>
    <a href="#contact">Contact</a>
  </nav>
</div>

<style>
  nav a {
    color: #fff;
    text-decoration: none;
    font: 700 20px 'Raleway', sans-serif;
    margin: 0px 10px;
    padding: 10px 10px;
    position: relative;
  }

  .navwrapper {
    position: relative;
  }

  .brackets a:before,
  .brackets a:after {
    position: absolute;
    opacity: 0;
    font-size: 32px;
    top: 0px;
    transition: all 0.3s;
  }

  .brackets a:before {
    color: var(--coding);
    content: '{ ';
    left: -10px;
    transform: translateX(10px);
  }

  .brackets a:after {
    color: var(--coding);
    content: '}';
    right: -10px;
    transform: translateX(-10px);
  }

  .brackets a:hover:before,
  .brackets a:hover:after {
    opacity: 1;
    transform: translateX(0px);
  }
</style>
