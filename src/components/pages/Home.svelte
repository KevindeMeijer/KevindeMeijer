<script>
  import Section from '../global/Section.svelte';
  import NavItems from '../global/NavItems.svelte';
</script>

<Section id="home" class="home">
  <div class="perspective-text">
    <div class="perspective-line">
      <p class="perspective" />
      <p class="perspective">UX . UI . FE-DEV</p>
    </div>
    <div class="perspective-line">
      <p class="perspective">Welcome</p>
      <p class="perspective">Kevin</p>
    </div>
    <div class="perspective-line">
      <p class="perspective">to my</p>
      <p class="perspective">de</p>
    </div>
    <div class="perspective-line">
      <p class="perspective">Website</p>
      <p class="perspective">Meijer</p>
    </div>
    <div class="perspective-line">
      <p class="perspective">Hover here !</p>
    </div>
  </div>
  <div class="nav">
    <NavItems />
  </div>
  >
</Section>

<style>
  .nav {
    display: grid;
    place-items: center;
  }

  .perspective-text {
    width: auto;
    margin: auto;
    position: relative;
    right: 9%;
  }

  .perspective-line {
    height: 50px;
    overflow: hidden;
    position: relative;
  }

  .perspective {
    color: white;
    font: 900 58px/46px 'Montserrat', sans-serif;
    letter-spacing: -2px;
    text-align: center;
    text-transform: uppercase;

    height: 50px;
    margin: 0;
    transition: var(--title-transition);
  }

  .perspective-line:nth-child(odd) {
    transform: skew(60deg, -30deg) scaleY(0.667);
  }

  .perspective-line:nth-child(even) {
    transform: skew(0deg, -30deg) scaleY(1.337);
  }

  .perspective-text:hover p {
    transform: translate(0, -50px);
  }

  .perspective-line:nth-child(1) {
    left: 29px;
  }

  .perspective-line:nth-child(2) {
    left: 58px;
    background: var(--red_gradient);
  }

  .perspective-line:nth-child(3) {
    left: 87px;
    background: var(--blue_gradient);
  }

  .perspective-line:nth-child(4) {
    left: 116px;
    background: var(--yellow_gradient);
  }

  .perspective-line:nth-child(5) {
    left: 145px;
  }
</style>
