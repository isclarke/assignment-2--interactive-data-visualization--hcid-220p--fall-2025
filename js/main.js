// Load CSV data
d3.csv(`data/data.csv`).then(data => {

    // Parse both date and time
    const parseDate = d3.timeParse(`%Y-%m-%d`);
    const parseTime = d3.timeParse(`%I:%M %p`);

    data.forEach(d => {
        const dateObj = parseDate(d.date);
        const timeObj = parseTime(d.time);

        // DateTime Object
        d.dateTime = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            timeObj.getHours(),
            timeObj.getMinutes()
        );

        d.dateObj = dateObj;
        d.timeObj = timeObj;
        d.dateOnly = d3.timeFormat(`%Y-%m-%d`)(d.dateTime); //Year, Month, Day Format
    });

    const minDate = d3.min(data, d => d.dateTime);
    const maxDate = d3.max(data, d => d.dateTime);

    // Layout
    const margin = { top: 50, right: 50, bottom: 100, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 1200 - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, width]);

    const yScale = d3.scaleTime()
        .domain([parseTime(`12:00 AM`), parseTime(`11:59 PM`)])
        .range([height, 0]); // Bottom = midnight, Top = 23:59

    // SVG
    const svg = d3.select(`#data-csv-container`)
        .append(`svg`)
        .attr(`width`, width + margin.left + margin.right)
        .attr(`height`, height + margin.top + margin.bottom)
        .append(`g`)
        .attr(`transform`, `translate(${margin.left},${margin.top})`);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat(`%b %d`));

    svg.append(`g`) // Ensure X Axis positon
        .attr(`transform`, `translate(0, ${height})`)
        .call(xAxis);

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat(`%I %p`))
        .ticks(d3.timeHour.every(1));

    svg.append(`g`)
        .call(yAxis);

    // Sunday tick labels
    svg.selectAll(`.tick text`)
        .filter(d => d.getDay && d.getDay() === 0)
        .classed(`sunday-text`, true);

    // Title
    svg.append(`text`)
        .attr(`x`, width / 2)
        .attr(`y`, -20)
        .attr(`text-anchor`, `middle`)
        .style(`font-size`, `16px`)
        .text(`Weeks begin on Sunday (BLUE DATES)`); // Add Title/ Legend for Sunday

    // Scatter plot points
    svg.selectAll(`.dot`)
        .data(data)
        .enter()
        .append(`circle`) //Create dot or circle
        .attr(`class`, `dot`)
        .attr(`cx`, d => xScale(d.dateTime)) //Where point is Horizontally (date)
        .attr(`cy`, d => yScale(d.timeObj)) // Where point is vertically (time)
        .attr(`r`, 5); //Size of point
});
