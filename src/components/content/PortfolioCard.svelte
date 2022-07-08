<div class="portfolio-card">
  <h2>
    <slot name="title">
      <span class="missing">Something went wrong here</span>
    </slot>
  </h2>

  <div class="year">
    <slot name="year">
      <span class="missing">Please contact me about it</span>
    </slot>
  </div>

  <div class="desc">
    <slot name="desc">
      <span class="missing" />
    </slot>
  </div>
</div>

<style>
  .portfolio-card {
    width: calc(100% - 2em);
    border: 1px solid #aaa;
    border-radius: 2px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1em;
    margin-bottom: 1em;
  }

  h2 {
    padding: 0 0 0.2em 0;
    margin: 0 0 0.5em 0;
    border-bottom: 2px solid var(--blue);
  }

  .year,
  .desc {
    padding: 0 0 0 1.5em;
    background: 0 50% no-repeat;
    background-size: 1em 1em;
    margin: 0 0 0.5em 0;
    line-height: 1.2;
  }
  .missing {
    color: #999;
  }
</style>
