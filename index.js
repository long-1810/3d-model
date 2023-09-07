const canvas = document.getElementById("main")
const ctx = canvas.getContext("2d")

canvas.width = 100;
canvas.height = 800;
ctx.translate(canvas.width / 2, canvas.height / 2)

const O = math.matrix([0, 0, 0])
const canvasWidth = canvas.width
const canvasHeight = canvas.height
const viewportWidth = 1
const viewportHeight = 1
const distanceFromCamera = 1

const pixelSize = 1

const backgroundColor = math.matrix([255,255,255])


const scene = {
    spheres: [
        {
            center: math.matrix([0, -1, 3]),
            radius: 1,
            color: math.matrix([255,0,0])
        },
        {
            center: math.matrix([2, 0, 4]),
            radius: 1,
            color: math.matrix([0,0,255])
        },
        {
            center: math.matrix([-2, 0, 4]),
            radius: 1,
            color: math.matrix([0,255,0])
        },
        {
            color : math.matrix([255, 255, 0]),
            center : math.matrix([0, -5001, 0]),
            radius : 5000
        }
    ],
    lights: [
        {
            type: "ambient",
            intensity: 0.2,
        }, 
        {
            type: "point",
            intensity: 0.6,
            position: math.matrix([2, 1, 0]),
        }, 
        {
            type: "directional",
            intensity: 0.2,
            direction: math.matrix([1, 4, 4]),
        }
    ]
}



function main() {
    for (let x = -canvasWidth / 2; x <= canvasWidth / 2; x++) {
        for (let y = -canvasHeight / 2; y <= canvasHeight / 2; y++) {
            const D = canvasToViewport(x, y)
            const color = traceRay(O, D, 1, Infinity)
            ctx.fillStyle = `rgb(${color._data[0]}, ${color._data[1]}, ${color._data[2]})`
            ctx.fillRect(x, y, pixelSize, pixelSize)
        }
    }
}

function canvasToViewport(x, y) {
    return math.matrix([(x * viewportWidth / canvasWidth), (y * viewportHeight / canvasHeight), distanceFromCamera])
}

function traceRay(O, D, tMin, tMax) {
    let tClosest = Infinity
    let closestSphere = undefined
    for (let sphere of scene.spheres) {
        const [t1, t2] = calculateIntersectionSphereRay(O, D, sphere)
        if (tMin <= t1 && t1 <= tMax && t1 < tClosest) {
            tClosest = t1
            closestSphere = sphere
        }
        if (tMin <= t2 && t2 <= tMax && t2 < tClosest) {
            tClosest = t2
            closestSphere = sphere
        }
    }
    if (!closestSphere) {
        return backgroundColor
    }

    P = O + math.multiply(tClosest, D)  // Compute intersection
    N = math.subtract(P, closestSphere.center)  // Compute sphere normal at intersection
    N = math.multiply(N, 1/length(N))

    return math.multiply(computeLighting(P, N), closestSphere.color)
}

function calculateIntersectionSphereRay(O, D, sphere) {
    r = sphere.radius
    CO = math.subtract(O, sphere.center)

    a = math.multiply(D, D)
    b = 2 * math.multiply(CO, D)
    c = math.multiply(CO, CO) - r * r

    delta = b * b - 4 * a * c
    if (delta < 0) {
        return [Infinity, Infinity]
    }

    t1 = (-b + Math.sqrt(delta)) / (2 * a)
    t2 = (-b - Math.sqrt(delta)) / (2 * a)
    return [t1, t2]
}

function computeLighting(P, N) {
    i = 0.0
    for (let light in scene.lights) {
        if (light.type === "ambient") {
           i += light.intensity
        } else {
            if (light.type === "point") {
               L = math.subtract(light.position, P)
            } else {
               L = light.direction
            }

            dotProductNAndL = math.multiply(N, L)
            console.log(dotProductNAndL)
            if (dotProductNAndL > 0) {
               i += light.intensity * dotProductNAndL/(length(N) * length(L))
            }
        }
    }
    return i
}

function length(vector) {
    console.log(vector)
    return Math.sqrt(vector._data[0]*vector._data[0] + vector._data[1]*vector._data[1])
}


main()
