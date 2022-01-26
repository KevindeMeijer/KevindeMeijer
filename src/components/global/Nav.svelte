<script>
  export let title;
</script>


<div class="chapter_title">
  <h1>{title}</h1>
  <div class="navwrapper">
    <nav class="brackets">
      <a href="#top">Home</a>
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </nav>
  </div>
</div>

<style>

/* ? Check if nessescary */
/* nav {
  font-family: 'Raleway', sans-serif;
  text-align: center;
} */

nav a {
  color: #fff;
  text-decoration: none;
  font: 700 20px 'Raleway', sans-serif;
  margin: 0px 10px;
  padding: 10px 10px;
  position: relative;
  /* z-index: 0; */
  /* cursor: pointer; Svelte might do this */
}

.chapter_title {
  color: var(--white);
  display: grid;
  place-items: center;
  text-align: center;
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