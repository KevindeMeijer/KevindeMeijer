<script>
  import Nav from '../global/Nav.svelte';
  import Section from '../global/Section.svelte';
  import SocialIcon from '../content/SocialIcon.svelte';
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
</svelte:head>

<Section id="contact" class="contact">
  <Nav title="Contact" />
  <div class="text">
    <h2>Kevin de Meijer</h2>
    <br />
    <p>UX / UI Design <br />Front-end Development</p>
    <p class="bold">
      Feel free to get in Touch if you want to collaborate on something cool or
      interesting. I'm always open to learn and up for a challenge.
    </p>
    <p>
      I'm currently unavailible for any projects that fall outside of my study.
    </p>

    <SocialIcon
      link="https://github.com/KevindeMeijer"
      color="social-icon github"
      fa_icon="fa fa-github"
    />

    <SocialIcon
      link="https://steamcommunity.com/id/kevkev_beast/"
      color="social-icon steam"
      fa_icon="fa fa-steam"
    />

    <SocialIcon
      link="https://www.instagram.com/kevkevdemeijer/"
      color="social-icon instagram"
      fa_icon="fa fa-instagram"
    />

    <SocialIcon
      link="https://www.linkedin.com/in/kevindemeijer/"
      color="social-icon instagram"
      fa_icon="fa fa-linkedin-square"
    />

    <SocialIcon
      link="https://codepen.io/Kevin_de_Meijer"
      color="social-icon codepen"
      fa_icon="fa fa-codepen"
    />

    <SocialIcon
      link="https://t.me/KevindeMeijer"
      color="social-icon telegram"
      fa_icon="fa fa-telegram"
    />

    <SocialIcon
      link="https://www.twitch.tv/kevkev_beast"
      color="social-icon twitch"
      fa_icon="fa fa-twitch"
    />

    <SocialIcon
      link="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      color="social-icon youtube"
      fa_icon="fa fa-youtube-play"
    />
  </div>
  <div class="map">
    <iframe
      allowfullscreen
      title="Hot singles in my area"
      scrolling="no"
      marginheight="0"
      marginwidth="0"
      src="https://maps.google.com/maps?width=100%25&amp;height=100%25&amp;hl=nl&amp;q=Naarden+()&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
      width="100%"
      height="100%"
      frameborder="0"
      style="border: 0;"
    />
  </div>
</Section>

<style>
  .text {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
  }

  .map {
    background-color: var(--background);
    grid-row: 2 / 3;
    grid-column: 2 / 3;
  }
</style>
