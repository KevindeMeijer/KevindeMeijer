<script>
  import Home from './components/pages/Home.svelte';
  import About from './components/pages/About.svelte';
  import Work from './components/pages/Work.svelte';
  import Contact from './components/pages/Contact.svelte';
</script>

<div class="container">
  <Home />
  <About />
  <Work />
  <Contact />
</div>

<style>
  .container {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    height: 100vh;
  }
</style>
