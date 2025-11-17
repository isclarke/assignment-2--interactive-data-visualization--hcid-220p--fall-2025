// Load CSV data
d3.csv('data/data.csv').then(data => {
    // Parse both date and time
    const parseDateTime = d3.timeParse('%Y-%m-%d, %I:%M %p');

    data.forEach(d => {
        // Combine both columns into one string, e.g. "2025-11-03, 06:46 PM"
        d.dateTime = parseDateTime(`${d.date}, ${d.time}`);
        // Also store just the date portion for grouping
        d.dateOnly = d3.timeFormat('%Y-%m-%d')(d.dateTime);
    });

    // Min and Max
    const minDate = d3.min(data, d => d.dateTime);
    const maxDate = d3.max(data, d => d.dateTime);

    // Create CONST for all dates
    const allDates = d3.timeDays(minDate, d3.timeDay.offset(maxDate, 1));

    // Count events per day using rollup
    const eventCount = d3.rollup(data, v => v.length, d => d.dateOnly);

    // Scale of X axis
    const xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, 1200]);

    // Create SVG
    const svg = d3.select('#data-csv-container')
        .append('svg')
        .attr('width', 1200)
        .attr('height', 200);

    // Create X axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(1))
        .tickFormat(d => d3.timeFormat('%b %d')(d));

    //Call and move X axis
    svg.append('g')
        .attr('transform', 'translate(0, 150)')
        .call(xAxis);

    // Add Sunday class for tick labels
    svg.selectAll('.tick text')
        .filter(d => d.getDay() === 0)
        .classed('sunday-text', true);

    // Title label
    svg.append('text')
        .attr('x', 600)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Weeks begin on Sunday (BLUE DATES)');

    // Draw event lines
    svg.selectAll('.event-line')
        .data(allDates)
        .enter()
        //Appends line to each placeholder
        .append('line')
        .attr('class', 'event-line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        //Start positon on the X axis
        .attr('y1', 150)
        //Line determination based on event count for the date
        .attr('y2', d => {
            const key = d3.timeFormat('%Y-%m-%d')(d);
            const count = eventCount.get(key) || 0;
            return 150 - (count * 10);
        });
});
