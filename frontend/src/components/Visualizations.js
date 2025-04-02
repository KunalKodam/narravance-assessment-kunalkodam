import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getTaskRecords } from '../services/api';

const Visualizations = ({ taskId }) => {
    const lineChartRef = useRef(null);
    const barChartRef = useRef(null);
    const [records, setRecords] = useState([]);
    const [filterYear, setFilterYear] = useState('');

    useEffect(() => {
        if (!taskId) return;

        const fetchData = async () => {
            try {
                const data = await getTaskRecords(taskId);
                setRecords(data);
            } catch (error) {
                console.error('Error fetching records:', error);
            }
        };

        fetchData();
    }, [taskId]);

    useEffect(() => {
        if (records.length === 0) return;

        const filteredData = filterYear
            ? records.filter(r => new Date(r.sale_date).getFullYear() === parseInt(filterYear))
            : records;

        drawLineChart(filteredData);
        drawBarChart(filteredData);
    }, [records, filterYear]);

    const drawLineChart = (data) => {
        const svg = d3.select(lineChartRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Sort data by date
        const sortedData = [...data].sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));

        const x = d3.scaleTime()
            .domain(d3.extent(sortedData, d => new Date(d.sale_date)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d.price) * 1.1])
            .range([height, 0])
            .nice();

        const line = d3.line()
            .x(d => x(new Date(d.sale_date)))
            .y(d => y(d.price));

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X-axis (updated to show month and year)
        chart.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %Y')))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Y-axis
        chart.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format('$,.0f')));

        // X-axis label
        svg.append('text')
            .attr('x', width / 2 + margin.left)
            .attr('y', height + margin.top + 40)
            .style('text-anchor', 'middle')
            .text('Sale Date');

        // Y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2 - margin.top)
            .attr('y', margin.left - 50)
            .style('text-anchor', 'middle')
            .text('Price (USD)');

        // Line
        chart.append('path')
            .datum(sortedData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Data points
        chart.selectAll('.dot')
            .data(sortedData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(new Date(d.sale_date)))
            .attr('cy', d => y(d.price))
            .attr('r', 4)
            .attr('fill', 'steelblue');

        // Tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', '#34495e')
            .style('color', '#ffffff')
            .style('padding', '5px 10px')
            .style('border-radius', '5px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        chart.selectAll('.dot')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('r', 6);
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(`Company: ${d.company}<br>Model: ${d.car_model}<br>Date: ${d.sale_date}<br>Price: $${d.price}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 4);
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    };

    const drawBarChart = (data) => {
        const svg = d3.select(barChartRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const aggregatedData = d3.rollup(
            data,
            v => d3.sum(v, d => d.price),
            d => d.company
        );

        const dataArray = Array.from(aggregatedData, ([company, total]) => ({ company, total }));

        const x = d3.scaleBand()
            .domain(dataArray.map(d => d.company))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataArray, d => d.total) * 1.1])
            .range([height, 0])
            .nice();

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        chart.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        chart.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format('$,.0f')));

        // X-axis label
        svg.append('text')
            .attr('x', width / 2 + margin.left)
            .attr('y', height + margin.top + 40)
            .style('text-anchor', 'middle')
            .text('Company');

        // Y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2 - margin.top)
            .attr('y', margin.left - 50)
            .style('text-anchor', 'middle')
            .text('Total Sales (USD)');

        chart.selectAll('.bar')
            .data(dataArray)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.company))
            .attr('y', d => y(d.total))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.total))
            .attr('fill', 'steelblue');
    };

    return (
        <div>
            <h2>Task {taskId} Visualizations</h2>
            <div>
                <label>Filter by Year (optional): </label>
                <input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    placeholder="e.g., 2024"
                />
            </div>
            <h3>Sales Over Time (Line Chart)</h3>
            <svg ref={lineChartRef} width={600} height={400}></svg>
            <h3>Total Sales by Company (Bar Chart)</h3>
            <svg ref={barChartRef} width={600} height={400}></svg>
        </div>
    );
};

export default Visualizations;