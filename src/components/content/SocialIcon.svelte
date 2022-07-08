<script>
  export let link;
  export let color;
  export let fa_icon;
</script>

<div class="socials">
  <a target="_blank" href={link}>
    <div class={color}>
      <div class="icon">
        <i class={fa_icon} />
      </div>
    </div>
  </a>
</div>

<style>
  .socials {
    position: relative;
  }

  a {
    color: black;
    text-decoration: none;
  }

  .socials .social-icon {
    width: 70px;
    height: 70px;
    background: #eee;
    border: 2px solid var(--black);
    float: left;
    margin: 0 15px 15px 0;
    overflow: hidden;
    cursor: pointer;
  }

  .socials .social-icon .icon {
    line-height: 80px;
    text-align: center;
  }

  .socials .social-icon .icon i.fa {
    font-size: 35px;
    transition: var(--transition);
  }

  .socials .social-icon .icon:after {
    width: 70px;
    height: 70px;
    content: '';
    display: block;
    margin-top: 0px;
    transition: var(--transition);
  }

  .socials .social-icon:hover .icon:after {
    margin-top: -80px;
  }

  .socials .social-icon:hover .icon i.fa {
    color: var(--white);
  }

  .socials .social-icon.github .icon:after {
    background: #333;
  }

  .socials .social-icon.linkedin .icon:after {
    background: #0077b5;
  }

  .socials .social-icon.instagram .icon:after {
    background: #c13584;
  }

  .socials .social-icon.youtube .icon:after {
    background: #ff0000;
  }

  .socials .social-icon.twitch .icon:after {
    background: #9146ff;
  }

  .socials .social-icon.codepen .icon:after {
    background: #0ebeff;
  }

  .socials .social-icon.telegram .icon:after {
    background: #0088cc;
  }

  .socials .social-icon.steam .icon:after {
    background: #2a475e;
  }

  @media only screen and (max-width: 900px) {
    .socials .social-icon {
      width: 50px;
      height: 50px;
    }

    .socials .social-icon .icon:after {
      width: 80px;
      height: 80px;
      transition: var(--title-transition);
    }

    .socials .social-icon .icon {
      line-height: 55px;
    }

    .socials .social-icon .icon i.fa {
      font-size: 25px;
      transition: var(--title-transition);
    }
  }
</style>
