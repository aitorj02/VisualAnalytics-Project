

// Load preprocessed data
d3.csv("preprocessed_data2.csv").then(data => {
  console.log("Data loaded:", data);

  // Parse numeric values
  data.forEach(d => {
    d.rating = +d.rating;
    d.year = +d.year;
  });

  // Set up visualizations
  createHeatmap();
  createBarChart();
  createScatterPlot();
  updateBarChart();
  updateHeatmap();
  updateVisualizationsByGenre();
  connectFilters(); // Activate filters
  createScatterplots();


});

// Heatmap Placeholder
function createHeatmap() {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    // SVG container
    const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right + 20)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
   
    // Load preprocessed data
    d3.csv("preprocessed_data2.csv").then(data => {
      // Prepare data
      const heatmapData = [];
      const genresSet = new Set();
      const ratingBuckets = [1, 2, 3, 4, 5];
   
      // Group data by genre and rounded ratings
      data.forEach(d => {
        const genres = d.genres.replace("[", "").replace("]", "").split(", ");
        const roundedRating = Math.round(d.rating); // Round rating to nearest integer
  
        genres.forEach(genre => {
          genresSet.add(genre);
          const match = heatmapData.find(e => e.genre === genre && e.rating === roundedRating);
  
          if (match) {
            match.count += 1;
          } else {
            heatmapData.push({ genre, rating: roundedRating, count: 1 });
          }
        });
      }); 
  
       // Convert genres set to sorted array
      const genres = Array.from(genresSet).sort();
  
      // Scales
      const x = d3.scaleBand()
        .domain(genres)
        .range([0, width])
        .padding(0.05);
  
      const y = d3.scaleBand()
        .domain(ratingBuckets)
        .range([height, 0])
        .padding(0.05);
  
      const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, d3.max(heatmapData, d => d.count)]);
   
  
      svg.append("g")
        .call(d3.axisLeft(y));
  
      // Heatmap rectangles
      svg.selectAll(".cell")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.rating))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.count));
  
      // Add labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Genres");
  
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Ratings");

    // Legend
    const legendHeight = 100;
    const legendWidth = 10;

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(heatmapData, d => d.count)])
        .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    // Legend group
    const legendGroup = svg.append("g")
    .attr("transform", `translate(${width}, 30)`); // Increased x translation from width + 10 to width + 30


    // Gradient for the legend
    const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    legendGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(0));

    legendGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(d3.max(heatmapData, d => d.count)));

    // Legend rectangle
    legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Legend axis
    legendGroup.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);
    });
  } 
  
function createBarChart() {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    // SVG container
    svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Load preprocessed data
    d3.csv("preprocessed_data2.csv").then(data => {
      // Parse genres and ratings
      const genreRatings = {};
  
      data.forEach(d => {
        const genres = d.genres.replace("[", "").replace("]", "").split(", ");
        genres.forEach(genre => {
          if (!genreRatings[genre]) {
            genreRatings[genre] = { totalRating: 0, count: 0 };
          }
          genreRatings[genre].totalRating += +d.rating;
          genreRatings[genre].count += 1;
        });
      });
  
      // Compute average ratings
      const genreData = Object.entries(genreRatings).map(([genre, stats]) => ({
        genre,
        avgRating: stats.totalRating / stats.count
      }));
  
      // Scales
      const x = d3.scaleBand()
        .domain(genreData.map(d => d.genre))
        .range([0, width])
        .padding(0.2);
  
      const y = d3.scaleLinear()
        .domain([0, 5]) // Set y-axis domain from 0 to 5
        .range([height, 0]);
  
        svg.append("g")
        .call(d3.axisLeft(y));
  
      // Bars
      svg.selectAll(".bar")
        .data(genreData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.avgRating))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.avgRating))
        .attr("fill", "#3f51b5")
        .on("click", (event, d) => {
          // When a bar is clicked, update visualizations
          updateVisualizationsByGenre(d.genre);
        });
  
      // Labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Genres");
  
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Average Ratings");
    
    });
  }
  

// Scatter Plot Placeholder
function createScatterPlot() {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const svg = d3.select("#scatter-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("preprocessed_data2.csv").then(data => {
      data = data.filter(d => d.year > 1900); //filter out errors in years
      const yearData = d3.group(data, d => d.year);
      const scatterData = Array.from(yearData, ([year, values]) => ({
        year: +year,
        avgRating: d3.mean(values, d => +d.rating),
      }));
  
      const x = d3.scaleLinear()
        .domain(d3.extent(scatterData, d => d.year))
        .range([0, width]);
  
      const y = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);
        
      svg.append("g").call(d3.axisLeft(y));
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Year");
  
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Average Ratings");
  
      const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("display", "none");
  
      svg.selectAll(".point")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avgRating))
        .attr("r", 5)
        .attr("fill", "#3f51b5")
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`Year: <strong>${d.year}</strong><br>Avg Rating: <strong>${d.avgRating.toFixed(2)}</strong>`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mousemove", event => {
          tooltip.style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));
  
      // Add brushing functionality
      const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushed);
  
      svg.append("g")
        .attr("class", "brush")
        .call(brush);

        function brushed(event) {
            if (!event.selection) {
              // If no selection, reset visualizations
              updateBarChart();
              updateHeatmap();
              updateVisualizationsByGenre();
              return;
            }
          
            const [x0, x1] = event.selection.map(x.invert); // Get selected range in years
            const selectedYears = scatterData.filter(d => d.year >= x0 && d.year <= x1);
          
            updateBarChart(selectedYears.map(d => d.year));
            updateHeatmap(selectedYears.map(d => d.year));
          }
    });
  }
  function updateBarChart(selectedYears = null) {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.csv("preprocessed_data2.csv").then(data => {
      // Filter data based on selected years
      const filteredData = selectedYears
        ? data.filter(d => selectedYears.includes(+d.year))
        : data; // If no selection, show all data

      const genreRatings = {};
      filteredData.forEach(d => {
        const genres = d.genres.replace("[", "").replace("]", "").split(", ");
        genres.forEach(genre => {
          if (!genreRatings[genre]) {
            genreRatings[genre] = { totalRating: 0, count: 0 };
          }
          genreRatings[genre].totalRating += +d.rating;
          genreRatings[genre].count += 1;
        });
      });
  
      const genreData = Object.entries(genreRatings).map(([genre, stats]) => ({
        genre,
        avgRating: stats.totalRating / stats.count,
      }));
      // Sort genres alphabetically
      genreData.sort((a, b) => a.genre.localeCompare(b.genre));

      const x = d3.scaleBand()
        .domain(genreData.map(d => d.genre))
        .range([0, width])
        .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, 5])
      .range([height, 0]);

    const svg = d3.select("#bar-chart svg g");
    // Remove the existing x-axis
    svg.select(".x-axis").remove();

        // Update the bars with the filtered data
    svg.selectAll(".bar")
      .data(genreData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.genre))
      .attr("y", d => y(d.avgRating))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.avgRating))
      .attr("fill", "#3f51b5")
      .on("click", (event, d) => {
        const selectedGenre = d.genre;
        updateVisualizationsByGenre(selectedGenre);})


    // Update the x-axis with the filtered genres
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    const bars = svg.selectAll(".bar").data(genreData, d => d.genre);

    bars.exit().remove();

    bars.attr("x", d => x(d.genre))
      .attr("y", d => y(d.avgRating))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.avgRating))
      .attr("fill", "#3f51b5");
 
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.genre))
      .attr("y", d => y(d.avgRating))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.avgRating))
      .attr("fill", "#3f51b5")
      .on("click", (event, d) => {
        const selectedGenre = d.genre;
        updateVisualizationsByGenre(selectedGenre);
    });
  });
}
  

  
  
  function updateHeatmap(selectedYears = null) {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
      // SVG container

  
    d3.csv("preprocessed_data2.csv").then(data => {
        //prepare data
      // Filter data based on the selected years
      const filteredData = selectedYears
        ? data.filter(d => selectedYears.includes(+d.year))
        : data; // If no selection, show all data

      const heatmapData = [];
      const genresSet = new Set();
      const ratingBuckets = [1, 2, 3, 4, 5];

      // Calculate the average rating for each genre-rating pair
      filteredData.forEach(d => {
        const genres = d.genres.replace("[", "").replace("]", "").split(", ");
        const roundedRating = Math.round(d.rating); // Round rating to nearest integer

        genres.forEach(genre =>{
            genresSet.add(genre);
            const match = heatmapData.find(e => e.genre === genre && e.rating === roundedRating);
    
            if (match) {
              match.count += 1;
            } else {
              heatmapData.push({ genre, rating: roundedRating, count: 1 });
            }
          });
      });
    // Convert genres set to sorted array
    const genres = Array.from(genresSet).sort();
  
    
      const x = d3.scaleBand()
        .domain(genres)
        .range([0, width])
        .padding(0.05);
  
      const y = d3.scaleBand()
        .domain(ratingBuckets)
        .range([height, 0])
        .padding(0.05);
  
      const colorScale = d3.scaleSequential()
        .domain([0, d3.max(heatmapData, d => d.count)])
        .interpolator(d3.interpolateBlues);
  
      // Select the heatmap SVG group
       const svg = d3.select("#heatmap svg g");
   
      svg.select(".x-axis").remove();

      // Heatmap rectangles
      svg.selectAll(".cell")
        .data(heatmapData)
        .join("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.rating))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.count));
  
      // Add labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
  
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Ratings");
      // Add axes (if not already added)
       svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end"); 
  
    });
  }
  function updateVisualizationsByGenre(selectedGenre = null) {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    d3.csv("preprocessed_data2.csv").then(data => {
      // Filter data by selected genre
      data = data.filter(d => d.year > 1900); //filter out errors in years

      const filteredData = selectedGenre
        ? data.filter(d => d.genres.includes(selectedGenre))
        : data; // If no genre is selected, show all data
  
      // Update Scatter Plot

      const yearData = d3.group(filteredData, d => d.year);
      const scatterData = Array.from(yearData, ([year, values]) => ({
        year: +year,
        avgRating: d3.mean(values, d => +d.rating),
      }));
  
  

      const scatterSvg = d3.select("#scatter-plot svg g");
      scatterSvg.select(".x-axis").remove();
      
      const x = d3.scaleLinear()
        .domain(d3.extent(scatterData, d => d.year))
        .range([0, width]);
        
      const y = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);

        scatterSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
      scatterSvg.selectAll(".point")
        .data(scatterData)
        .join(
          enter =>
            enter
              .append("circle")
              .attr("class", "point")
              .attr("r", 5)
              .attr("cx", d => x(d.year))
              .attr("cy", d => y(d.avgRating))
              .attr("fill", "#3f51b5"),
          update =>
            update
              .attr("cx", d => x(d.year))
              .attr("cy", d => y(d.avgRating)),
          exit => exit.remove()
        );

  
      // Update Heatmap
      const heatmapData = [];
      const genresSet = new Set();
      const ratingBuckets = [1, 2, 3, 4, 5];

      // Calculate the average rating for each genre-rating pair
      filteredData.forEach(d => {
        const genres = d.genres.replace("[", "").replace("]", "").split(", ");
        const roundedRating = Math.round(d.rating); // Round rating to nearest integer

        genres.forEach(genre =>{
            genresSet.add(genre);
            const match = heatmapData.find(e => e.genre === genre && e.rating === roundedRating);
    
            if (match) {
              match.count += 1;
            } else {
              heatmapData.push({ genre, rating: roundedRating, count: 1 });
            }
          });
      });
      // Convert genres set to sorted array
      const genres = Array.from(genresSet).sort();
      
      const x1 = d3.scaleBand()
        .domain(genres)
        .range([0, width/2.35])
        .padding(0.05);
  
      const y1 = d3.scaleBand()
        .domain(ratingBuckets)
        .range([height, 0])
        .padding(0.05);
  
      const colorScale = d3.scaleSequential()
        .domain([0, d3.max(heatmapData, d => d.count)])
        .interpolator(d3.interpolateBlues);

      // Select the heatmap SVG group
      const svg = d3.select("#heatmap svg g");
        
      svg.select(".x-axis").remove();

      // Heatmap rectangles
      svg.selectAll(".cell")
        .data(heatmapData)
        .join("rect")
        .attr("class", "cell")
        .attr("x", d => x1(d.genre))
        .attr("y", d => y1(d.rating))
        .attr("width", x1.bandwidth())
        .attr("height", y1.bandwidth())
        .attr("fill", d => colorScale(d.count));

      // Add labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Ratings");
      // Add axes (if not already added)
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end"); 
    });
  }

  function connectFilters() {
    // Search bar listener
    d3.select("#search-bar").on("input", function () {
      const searchTerm = this.value.toLowerCase();
      filterVisualizations({ search: searchTerm });
    });
  
    // Time period filter
    d3.select("#time-period").on("input", function () {
      const selectedYear = +this.value;
      d3.select("#time-period-label").text(selectedYear);
      filterVisualizations({ year: selectedYear });
    });
  
    // Rating range filter
    d3.select("#rating-range").on("input", function () {
      const selectedRating = +this.value;
      d3.select("#rating-range-label").text(selectedRating);
      filterVisualizations({ rating: selectedRating });
    });
  }
  function filterVisualizations(filters) {
    d3.csv("preprocessed_data2.csv").then(data => {
      // Apply search filter
      if (filters.search) {
        data = data.filter(d =>
          d.title.toLowerCase().includes(filters.search) ||
          d.genres.toLowerCase().includes(filters.search)
        );
      }
  
      // Apply year filter
      if (filters.year) {
        data = data.filter(d => +d.year === filters.year);
      }
  
      // Apply rating filter
      if (filters.rating) {
        data = data.filter(d => +d.rating >= filters.rating);
      }
  
      // Update visualizations
/*       updateBarChart(data);
      updateHeatmap(data); */
      updateScatterPlot(data);
    });
  }
  function updateScatterPlot(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;


    data = data.filter(d => d.year > 1900); //filter out errors in years
    const yearData = d3.group(data, d => d.year);
  
    const scatterData = Array.from(yearData, ([year, values]) => ({
      year: +year,
      avgRating: d3.mean(values, d => +d.rating),
    }));

  
    const svg = d3.select("#scatter-plot svg g");
    svg.select(".x-axis").remove();

    const x = d3.scaleLinear()
      .domain(d3.extent(scatterData, d => d.year))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, 5])
      .range([height, 0]);
  

    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.selectAll(".point")
      .data(scatterData)
      .join(
        enter => enter.append("circle")
          .attr("class", "point")
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.avgRating))
          .attr("r", 5)
          .attr("fill", "#3f51b5"),
        update => update
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.avgRating)),
        exit => exit.remove()
      );
  }
  function createScatterplots() {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svgOriginal = d3.select("#scatter-original")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const svgPCA = d3.select("#scatter-pca")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("movie_stats_with_pca.csv").then(data => {
      data.forEach(d => {
        d.total_ratings = +d.total_ratings;
        d.average_rating = +d.average_rating;
        d.PC1 = +d.PC1;
        d.PC2 = +d.PC2;
      });
  
      const xOriginal = d3.scaleLinear()
        .domain(d3.extent(data, d => d.total_ratings))
        .range([0, width]);
  
      const yOriginal = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);
  
      const xPCA = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PC1))
        .range([0, width]);
  
      const yPCA = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PC2))
        .range([height, 0]);
  
      svgOriginal.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xOriginal));
  
      svgOriginal.append("g").call(d3.axisLeft(yOriginal));
  
      svgPCA.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xPCA));
  
      svgPCA.append("g").call(d3.axisLeft(yPCA));
  
      svgOriginal.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Total Ratings");
  
      svgOriginal.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Average Rating");
  
      svgPCA.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("PC1");
  
      svgPCA.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("PC2");
  
      const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("display", "none");
  
      function showTooltip(event, d) {
        tooltip.style("display", "block")
          .html(`Movie ID: ${d.movieId}<br>Average Rating: ${d.average_rating}<br>Total Ratings: ${d.total_ratings}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      }
  
      function hideTooltip() {
        tooltip.style("display", "none");
      }
  
      const originalPoints = svgOriginal.selectAll(".point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xOriginal(d.total_ratings))
        .attr("cy", d => yOriginal(d.average_rating))
        .attr("r", 5)
        .attr("fill", "#4caf50")
        .on("mouseover", function (event, d) {
          showTooltip(event, d);
          highlightPoints(d);
        })
        .on("mouseout", function () {
          hideTooltip();
          resetHighlights();
        });
  
      const pcaPoints = svgPCA.selectAll(".point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xPCA(d.PC1))
        .attr("cy", d => yPCA(d.PC2))
        .attr("r", 5)
        .attr("fill", "#f44336")
        .on("mouseover", function (event, d) {
          showTooltip(event, d);
          highlightPoints(d);
        })
        .on("mouseout", function () {
          hideTooltip();
          resetHighlights();
        });
  
      function highlightPoints(d) {
        originalPoints.attr("fill", p => p === d ? "#f44336" : "#4caf50");
        pcaPoints.attr("fill", p => p === d ? "#4caf50" : "#f44336");
      }
  
      function resetHighlights() {
        originalPoints.attr("fill", "#4caf50");
        pcaPoints.attr("fill", "#f44336");
      }
    });
  }