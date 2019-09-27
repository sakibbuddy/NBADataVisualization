
d3.csv("data/nba_data.csv")
    .then(function (data) {


            data.forEach(function (d,i) {
                d.popularity = parseInt(d.PAGEVIEWS,10) + parseInt(d.TWITTER_FAVORITE_COUNT,10) + parseInt(d.TWITTER_RETWEET_COUNT,10);
                //console.log(i);
                //console.log(d.popularity);
            })

            length = data.length;
            parsedData = data;

            var ndx = crossfilter(data);
            dim = ndx.dimension(dc.pluck('PLAYER'));

            group = dim.group().reduceSum(function (d) {
                return d.popularity
            });
            fakeGroup = getTops(group);

            function getTops(source_group) {
                return {
                    all: function () {
                        return source_group.top(10);
                    }
                };
            }
            console.log(dim)

            const svg = d3.select('svg');
            const svgContainer = d3.select('#barchart');

            const margin = 80;
            const width = 1000 - 2 * margin;
            const height = 600 - 2 * margin;

            const chart = svg.append('g')
                .attr('transform', `translate(${margin}, ${margin})`);

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(sample.map((s) => s.key))
                .padding(0.4)

            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, 100]);

            // vertical grid lines
            // const makeXLines = () => d3.axisBottom()
            //   .scale(xScale)

            const makeYLines = () => d3.axisLeft()
                .scale(yScale)

            chart.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));

            chart.append('g')
                .call(d3.axisLeft(yScale));

            // vertical grid lines
            // chart.append('g')
            //   .attr('class', 'grid')
            //   .attr('transform', `translate(0, ${height})`)
            //   .call(makeXLines()
            //     .tickSize(-height, 0, 0)
            //     .tickFormat('')
            //   )

            chart.append('g')
                .attr('class', 'grid')
                .call(makeYLines()
                    .tickSize(-width, 0, 0)
                    .tickFormat('')
                )

            const barGroups = chart.selectAll()
                .data(fakeGroup.all())
                .enter()
                .append('g')

            barGroups
                .append('rect')
                .attr('class', 'bar')
                .attr('x', (g) => xScale(g.key))
                .attr('y', (g) => yScale(g.value))
                .attr('height', (g) => height - yScale(g.value))
                .attr('width', xScale.bandwidth())
                .on('mouseenter', function (actual, i) {
                    d3.selectAll('.value')
                        .attr('opacity', 0)

                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 0.6)
                        .attr('x', (a) => xScale(a.key) - 5)
                        .attr('width', xScale.bandwidth() + 10)

                    const y = yScale(actual.value)

                    line = chart.append('line')
                        .attr('id', 'limit')
                        .attr('x1', 0)
                        .attr('y1', y)
                        .attr('x2', width)
                        .attr('y2', y)

                    barGroups.append('text')
                        .attr('class', 'divergence')
                        .attr('x', (a) => xScale(a.language) + xScale.bandwidth() / 2)
                        .attr('y', (a) => yScale(a.value) + 30)
                        .attr('fill', 'white')
                        .attr('text-anchor', 'middle')
                        .text((a, idx) => {
                            const divergence = (a.value - actual.value).toFixed(1)

                            let text = ''
                            if (divergence > 0) text += '+'
                            text += `${divergence}%`

                            return idx !== i ? text : '';
                        })

                })
                .on('mouseleave', function () {
                    d3.selectAll('.value')
                        .attr('opacity', 1)

                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 1)
                        .attr('x', (a) => xScale(a.key))
                        .attr('width', xScale.bandwidth())

                    chart.selectAll('#limit').remove()
                    chart.selectAll('.divergence').remove()
                })

            barGroups
                .append('text')
                .attr('class', 'value')
                .attr('x', (a) => xScale(a.key) + xScale.bandwidth() / 2)
                .attr('y', (a) => yScale(a.value) + 30)
                .attr('text-anchor', 'middle')
                .text((a) => `${a.value}%`)

            svg
                .append('text')
                .attr('class', 'label')
                .attr('x', -(height / 2) - margin)
                .attr('y', margin / 2.4)
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Love meter (%)')

            svg.append('text')
                .attr('class', 'label')
                .attr('x', width / 2 + margin)
                .attr('y', height + margin * 1.7)
                .attr('text-anchor', 'middle')
                .text('Languages')

            svg.append('text')
                .attr('class', 'title')
                .attr('x', width / 2 + margin)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text('Most loved programming languages in 2018')

            svg.append('text')
                .attr('class', 'source')
                .attr('x', width - margin / 2)
                .attr('y', height + margin * 1.7)
                .attr('text-anchor', 'start')
                .text('Source: Stack Overflow, 2018')

            /*dc.barChart("#year")
                .width(1200)
                .height(400)
                .margins({ top: 10, right: 50, bottom: 40, left: 50 })
                .dimension(dim)
                .group(fakeGroup)

                .x(d3.scale.ordinal().domain(data.map(function(d){
                    return d.PLAYER
                })))
                .xUnits(dc.units.ordinal)
                //.y(d3.scale.linear().domain([0,7]))
                /!*.xUnits(function () {
                    return 200;
                })*!/
                .elasticY(true)
                .clipPadding(10)
                .xAxisLabel("Player")
                .yAxisLabel("Popularity")
                .mouseZoomable(true)
                .renderLabel(true)
                .brushOn(false)
                .transitionDuration(100)
                .yAxis().ticks(25);

            dc.renderAll();*/

    })
    .catch(function (error) {

    })


/*unction show_ufo_year(ndx) {
     dim = ndx.dimension(dc.pluck('SALARY_MILLIONS'));
    console.log(dim)
     group = dim.group().reduceCount();

    dc.barChart("#year")
        .width(1200)
        .height(400)
        .margins({ top: 10, right: 50, bottom: 40, left: 50 })
        .dimension(dim.top(25))
        .brushOn(false)
        //.dimension(dim)
        .group(group)
        .transitionDuration(100)
        .x(d3.scale.ordinal().domain(function () {

        })
        .y(d3.scale.linear().domain([0,7]))
        .xUnits(function () {
            return 200;
        })
        .elasticY(true)
        .clipPadding(10)
        .xAxisLabel("Salary")
        .yAxisLabel("Popularity")
        .mouseZoomable(true)
        .renderLabel(true)
        .yAxis().ticks(20);



}*/



/*.function to refresh page when Refresh Charts buttons are clicked */

function refreshPage() {
    window.location.reload();
}