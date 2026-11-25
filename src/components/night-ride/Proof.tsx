import Image from "next/image";

/**
 * Proof blocks shared by the homepage and the service pages: the six sites we built and the
 * scrolling Google reviews. Both need the icon sprite (NrSprite) and a `.nr-home` wrapper.
 * Review text is word for word from the Creative Cowboys Google profile.
 */

/** The six project cards. Each opens the live site in a new tab. */
export function WorkGrid() {
  return (
    <div className="work">
      <a className="card proj" href="https://thegroveatdefoorfarm.com" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>thegroveatdefoorfarm.com</span></div><Image src="/night-ride/work/grove.jpg" alt="The Grove at DeFoor Farm homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 01</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">The Grove at DeFoor Farm</h3>
          <p>Wedding and event venue · West Georgia</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Video hero</span><span className="pill plain">Local SEO</span></div>
        </div>
      </a>
      <a className="card proj" href="https://shanagenenbacher.com" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>shanagenenbacher.com</span></div><Image src="/night-ride/work/shana.jpg" alt="Shana Genenbacher real estate homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 02</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">Shana Genenbacher</h3>
          <p>Realtor, KW Montgomery · Prattville, AL</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Live MLS search</span><span className="pill plain">CRM</span></div>
        </div>
      </a>
      <a className="card proj" href="https://blueridge.creativecowboys.co" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>blueridge.creativecowboys.co</span></div><Image src="/night-ride/work/blueridge.jpg" alt="Blue Ridge Golf Carts homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 03</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">Blue Ridge Golf Carts</h3>
          <p>Golf cart sales and service · Travelers Rest, SC</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Online parts store</span><span className="pill plain">Cart builder</span></div>
        </div>
      </a>
      <a className="card proj" href="https://innovativeconstructiongroup.com" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>innovativeconstructiongroup.com</span></div><Image src="/night-ride/work/icg.jpg" alt="Innovative Construction Group homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 04</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">Innovative Construction Group</h3>
          <p>Custom home builder · West Georgia and East Alabama</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Project portfolio</span><span className="pill plain">SEO articles</span></div>
        </div>
      </a>
      <a className="card proj" href="https://bremencia.com" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>bremencia.com</span></div><Image src="/night-ride/work/bremencia.jpg" alt="Commercial Insurance Agency homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 05</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">Commercial Insurance Agency</h3>
          <p>Independent insurance · Bremen, GA</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Quote funnel</span><span className="pill plain">AI chat</span></div>
        </div>
      </a>
      <a className="card proj" href="https://www.harmonicproduction.co" target="_blank" rel="noopener">
        <div className="shot"><div className="bar"><i></i><i></i><i></i><span>harmonicproduction.co</span></div><Image src="/night-ride/work/harmonic.jpg" alt="Harmonic Production homepage" loading="lazy" width={1200} height={750} /></div>
        <div className="proj-body">
          <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 06</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
          <h3 className="h3">Harmonic Production</h3>
          <p>Audio visual and concert production · Cleveland, TN</p>
          <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Local SEO</span><span className="pill plain">Project portfolio</span></div>
        </div>
      </a>
    </div>
  );
}

/** The scrolling review cards. The second set is a hidden copy that makes the loop seamless. */
export function ReviewsMarquee() {
  return (
    <div className="marquee">
      <div className="track">
          <article className="card quote"><div className="qm">“</div><p>They have completely transformed my marketing, and my phone rings off the hook now! I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO</p><div className="who"><span className="avatar logo fill"><Image src="/night-ride/reviews/arctic-law.png" alt="" width={96} height={96} /></span><div><b>Kaden VanWey</b><span>Arctic Law Alaska · Wasilla, AK</span></div></div></article>
          <article className="card quote"><div className="qm">“</div><p>Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.</p><div className="who"><span className="avatar logo light"><Image src="/night-ride/reviews/cia.png" alt="" width={96} height={96} /></span><div><b>Rob Goldin</b><span>Commercial Insurance Agency · Bremen, GA</span></div></div></article>
          <article className="card quote"><div className="qm">“</div><p>Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do. They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that.</p><div className="who"><span className="avatar logo pad-s"><Image src="/night-ride/reviews/shana.png" alt="" width={96} height={96} /></span><div><b>Shana Genenbacher</b><span>Realtor · Prattville, AL</span></div></div></article>
          <article className="card quote"><div className="qm">“</div><p>Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime.</p><div className="who"><span className="avatar logo pad"><Image src="/night-ride/reviews/harmonic.png" alt="" width={240} height={93} /></span><div><b>Ryan Coffey</b><span>Harmonic Production · Cleveland, TN</span></div></div></article>
          <article className="card quote"><div className="qm">“</div><p>I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and resources to me. Because of this, we are seeing fresh growth in our company.</p><div className="who"><span className="avatar">DH</span><div><b>Daniel Hooper</b><span>Google review</span></div></div></article>
          <article className="card quote"><div className="qm">“</div><p>Creative Cowboys Media knows exactly what they’re doing! They get the job done right and it shows in the projects that they get their hands on.</p><div className="who"><span className="avatar">AM</span><div><b>Alexandra McKinley</b><span>Google review</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>They have completely transformed my marketing, and my phone rings off the hook now! I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO</p><div className="who"><span className="avatar logo fill"><Image src="/night-ride/reviews/arctic-law.png" alt="" width={96} height={96} /></span><div><b>Kaden VanWey</b><span>Arctic Law Alaska · Wasilla, AK</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.</p><div className="who"><span className="avatar logo light"><Image src="/night-ride/reviews/cia.png" alt="" width={96} height={96} /></span><div><b>Rob Goldin</b><span>Commercial Insurance Agency · Bremen, GA</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do. They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that.</p><div className="who"><span className="avatar logo pad-s"><Image src="/night-ride/reviews/shana.png" alt="" width={96} height={96} /></span><div><b>Shana Genenbacher</b><span>Realtor · Prattville, AL</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime.</p><div className="who"><span className="avatar logo pad"><Image src="/night-ride/reviews/harmonic.png" alt="" width={240} height={93} /></span><div><b>Ryan Coffey</b><span>Harmonic Production · Cleveland, TN</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and resources to me. Because of this, we are seeing fresh growth in our company.</p><div className="who"><span className="avatar">DH</span><div><b>Daniel Hooper</b><span>Google review</span></div></div></article>
          <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Creative Cowboys Media knows exactly what they’re doing! They get the job done right and it shows in the projects that they get their hands on.</p><div className="who"><span className="avatar">AM</span><div><b>Alexandra McKinley</b><span>Google review</span></div></div></article>
        </div>
    </div>
  );
}
