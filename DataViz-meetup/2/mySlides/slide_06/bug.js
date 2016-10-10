pt.bug = pt.bug || {};

pt.bug.init = function() {
const mainCanvasWidth = 960
const mainCanvasHeight = 500

const segmentCount = 24
const baseStrength = 0.5

const canvas = document.querySelector('canvas#main')

d3.select("section#bug")
	.append("canvas")
	.attr("class", "bug")
	.attr("width", mainCanvasWidth)
	.attr("height", mainCanvasHeight);
	
const ctx = d3.select("canvas.bug").node().getContext('2d', {alpha: false})

ctx.transform(1, 0, 0, 1, mainCanvasWidth / 2, mainCanvasHeight / 2)

const id = d => d.id
const radius = node => node.radius
const distance = link => link.distance

const thickness = segmentNumber =>  1 + 8 * Math.sin(Math.PI * (0.15 + 0.85 * segmentNumber / segmentCount))

const segment = segmentNumber => {
  const distance = thickness(segmentNumber)
  const radius = distance * 3/4
  return {
    number: segmentNumber,
    nodes: [
      { radius, id: `segment ${segmentNumber} front dorsal`,  x: -20 * (segmentNumber - 1) + 200, y:  16, skin: true },
      { radius, id: `segment ${segmentNumber} front median`,  x: -20 * (segmentNumber - 1) + 200, y:   0, skin: true },
      { radius, id: `segment ${segmentNumber} front ventral`, x: -20 * (segmentNumber - 1) + 200, y: -16, skin: true },
      { radius, id: `segment ${segmentNumber} back dorsal`,   x: -20 * segmentNumber + 200, y:  8 },
      { radius, id: `segment ${segmentNumber} back ventral`,  x: -20 * segmentNumber + 200, y: -8 }
    ],
    links: [
      { distance, strength: 0,            source: `segment ${segmentNumber} front dorsal`,  target: `segment ${segmentNumber} front ventral`, skin: true },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front dorsal`,  target: `segment ${segmentNumber} front median`,  skin: true },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front median`,  target: `segment ${segmentNumber} front ventral`, skin: true  },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} back dorsal`,   target: `segment ${segmentNumber} back ventral` },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front dorsal`,  target: `segment ${segmentNumber} back dorsal` },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front median`,  target: `segment ${segmentNumber} back dorsal` },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front median`,  target: `segment ${segmentNumber} back ventral` },
      { distance, strength: baseStrength, source: `segment ${segmentNumber} front ventral`, target: `segment ${segmentNumber} back ventral` }
    ]
  }
}

const bodyNodes = d3.range(0, segmentCount).map(segment)
const body = bodyNodes.reduce((prev, next) => {
  const prevsegmentNodes = prev.nodes.length > 0 && prev.nodes.slice(-2)
  const nodes = prev.nodes.concat(next.nodes)
  const segmentNumber = next.number
  const distance = thickness(segmentNumber)
  let links = prev.links.concat(next.links)
  if(prevsegmentNodes) {
    links = links.concat([
      {distance, strength: baseStrength, source: `segment ${segmentNumber - 1} back dorsal`, target: `segment ${segmentNumber} front dorsal`},
      {distance, strength: baseStrength, source: `segment ${segmentNumber - 1} back ventral`, target: `segment ${segmentNumber} front ventral`},
      {distance, strength: baseStrength, source: `segment ${segmentNumber - 1} back dorsal`, target: `segment ${segmentNumber} front median`},
      {distance, strength: baseStrength, source: `segment ${segmentNumber - 1} back ventral`, target: `segment ${segmentNumber} front median`},
      {distance, strength: -0.1 * baseStrength, source: `segment ${segmentNumber - 1} front dorsal`, target: `segment ${segmentNumber} front dorsal`},
      {distance, strength: -0.1 * baseStrength, source: `segment ${segmentNumber - 1} front median`, target: `segment ${segmentNumber} front median`},
      {distance, strength: -0.1 * baseStrength, source: `segment ${segmentNumber - 1} front ventral`, target: `segment ${segmentNumber} front ventral`}
    ])
  }
  return { nodes, links }
}, {nodes: [], links: []})

const {nodes, links} = body

ctx.clearRect(-mainCanvasWidth / 2, - mainCanvasHeight / 2, mainCanvasWidth, mainCanvasHeight)

const strength = link => link.strength

let speedOfChange = 1

const randomSpeedChange = alpha => {
  let node
  let i
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i]
    if(node.skin) continue
    node.vx += 2 * (Math.random() - 0.4) * speedOfChange
    node.vy += 2 * (Math.random() - 0.4) * speedOfChange
  }
  speedOfChange = Math.min(5, Math.max(-5, speedOfChange + Math.random() - 0.5))
}

const fadeOut = () => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.005)"
  ctx.fillRect(-mainCanvasWidth / 2, - mainCanvasHeight / 2, mainCanvasWidth, mainCanvasHeight)
  requestAnimationFrame(fadeOut)
}

d3.forceSimulation(nodes)
  .alphaDecay(0.001) // set it to zero for the worm to live forever
  .alphaTarget(0)
  .velocityDecay(0.1)
  .force("repulsion", d3.forceManyBody().strength(-0.1).distanceMin(0).distanceMax(100))
  .force("center", d3.forceCenter())
  .force("link", d3.forceLink(links).id(id).strength(strength).distance(distance).iterations(10))
  .force("collide", d3.forceCollide().radius(radius))
  .force("randomSpeedChange", randomSpeedChange)
  .on("tick", draw)
  .on("end", fadeOut)

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
  ctx.fillRect(-mainCanvasWidth / 2, - mainCanvasHeight / 2, mainCanvasWidth, mainCanvasHeight)

  ctx.beginPath()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
  ctx.lineWidth = 1
  links.filter(d => !d.skin).forEach(drawLink)
  ctx.stroke()

  ctx.beginPath()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 15
  links.filter(d => d.skin).forEach(drawLink)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineWidth = 1
  nodes.forEach(drawNode)
  ctx.fill()
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
  ctx.stroke()
}

const drawLink = d => {
  ctx.moveTo(d.source.x, d.source.y)
  ctx.lineTo(d.target.x, d.target.y)
}

const drawNode = d => {
  const r = d.skin ? d.radius : 0.5
  ctx.moveTo(d.x + r, d.y)
  ctx.arc(d.x, d.y, r, 0, 2 * Math.PI)
}
}