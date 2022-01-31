<script>
  import About from './components/pages/About.svelte';
  import Skills from './components/pages/Skills.svelte';
  import Work from './components/pages/Work.svelte';
  import Contact from './components/pages/Contact.svelte';
</script>

<div class="container">
  <About />
  <Skills />
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
