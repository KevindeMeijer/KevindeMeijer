<script>
  import PortfolioCard from '../content/PortfolioCard.svelte';
</script>

<PortfolioCard>
  <span slot="title"><h4>Barber's Application</h4></span>
  <span slot="year"> Year 1 | Semester 1 </span>
  <span slot="desc">
    A project dedicated to learn the ways of Agile working. Delivering updates
    every 2 weeks.
  </span>
</PortfolioCard>

<PortfolioCard>
  <span slot="title"><h4>Employment Insights</h4> </span>
  <span slot="year"> Year 1 | Semester 2 </span>
  <span slot="desc">
    A webpage which tracks existing job offers, to tell current students what is
    needed in jobs they need to learn.
  </span>
</PortfolioCard>

<PortfolioCard>
  <span slot="title"><h4>Learning Analytics</h4> </span>
  <span slot="year"> Year 2</span>
  <span slot="desc">
    LeAn tracked educational progress of students. This was done through showing
    them progress of teacher feedback, reviews done/given and worked hours. All
    on the same convenient page.
  </span>
</PortfolioCard>

<PortfolioCard>
  <span slot="title"
    ><h4>
      <a class="link" href="https://openict.fyndr.wiki" target="_blank">FyndR</a
      >
    </h4>
  </span>
  <span slot="year"> Year 3</span>
  <span slot="desc">
    An educational database where students and teachers can upload files,
    webpages or presentations. This allowed other students that were having the
    same problems to look up solutions easier.
  </span>
</PortfolioCard>
