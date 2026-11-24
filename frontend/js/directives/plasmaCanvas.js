(function () {
    "use strict";

    angular
        .module("plasmaSimulatorApp")

        .directive("plasmaCanvas", function () {
            return {
                restrict: "E",

                scope: {
                    snapshot: "=",
                },

                templateUrl: "templates/plasma-canvas.html",

                link: function (scope, element) {
                    var canvas = element.find("canvas")[0];

                    var ctx = canvas.getContext("2d");

                    var animationFrameId;

                    function resize() {
                        var width = element[0].clientWidth;

                        canvas.width = Math.max(700, width);

                        canvas.height = Math.max(
                            560,
                            Math.round(canvas.width * 0.62),
                        );
                    }

                    function drawBackground() {
                        ctx.fillStyle = "#101a35";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        ctx.strokeStyle = "rgba(130,150,190,0.10)";

                        ctx.lineWidth = 1;

                        var spacing = 40;

                        for (var x = 0; x < canvas.width; x += spacing) {
                            ctx.beginPath();

                            ctx.moveTo(x, 0);

                            ctx.lineTo(x, canvas.height);

                            ctx.stroke();
                        }

                        for (var y = 0; y < canvas.height; y += spacing) {
                            ctx.beginPath();

                            ctx.moveTo(0, y);

                            ctx.lineTo(canvas.width, y);

                            ctx.stroke();
                        }
                    }

                    function drawEmptyState() {
                        ctx.fillStyle = "#8f9bb8";

                        ctx.font = "14px Arial";

                        ctx.textAlign = "center";

                        ctx.fillText(
                            "Create and start a simulation",

                            canvas.width / 2,

                            canvas.height / 2,
                        );
                    }

                    function drawSnapshot(snapshot) {
                        var chamberRadius = snapshot.chamber.radius;

                        var cx = canvas.width / 2;

                        var cy = canvas.height / 2;

                        var displayRadius =
                            Math.min(canvas.width, canvas.height) * 0.42;

                        var scale = displayRadius / chamberRadius;

                        // =====================================
                        // OUTER CHAMBER
                        // =====================================

                        ctx.beginPath();

                        ctx.arc(cx, cy, displayRadius, 0, Math.PI * 2);

                        ctx.strokeStyle = "#53658d";

                        ctx.lineWidth = 2;

                        ctx.stroke();

                        // =====================================
                        // INNER REFERENCE RINGS
                        // =====================================

                        [0.25, 0.5, 0.75].forEach(function (fraction) {
                            ctx.beginPath();

                            ctx.arc(
                                cx,
                                cy,
                                displayRadius * fraction,
                                0,
                                Math.PI * 2,
                            );

                            ctx.strokeStyle = "rgba(110,140,190,0.12)";

                            ctx.lineWidth = 1;

                            ctx.stroke();
                        });

                        // =====================================
                        // HORIZONTAL AXIS
                        // =====================================

                        ctx.strokeStyle = "rgba(110,140,190,0.16)";

                        ctx.lineWidth = 1;

                        ctx.beginPath();

                        ctx.moveTo(cx - displayRadius, cy);

                        ctx.lineTo(cx + displayRadius, cy);

                        ctx.stroke();

                        // =====================================
                        // VERTICAL AXIS
                        // =====================================

                        ctx.beginPath();

                        ctx.moveTo(cx, cy - displayRadius);

                        ctx.lineTo(cx, cy + displayRadius);

                        ctx.stroke();

                        // =====================================
                        // PARTICLES
                        // =====================================

                        snapshot.particles.forEach(function (particle) {
                            /*
                             * Backend coordinates are
                             * physical metres relative
                             * to chamber centre.
                             *
                             * Canvas:
                             *
                             * +x -> right
                             * +y -> down
                             *
                             * Physics:
                             *
                             * +x -> right
                             * +y -> up
                             *
                             * Therefore y is inverted.
                             */

                            var x = cx + particle.x * scale;

                            var y = cy - particle.y * scale;

                            var isElectron = particle.species === "electron";

                            var particleRadius = isElectron ? 2.4 : 3.2;

                            var color = isElectron ? "#62d9ff" : "#ff806c";

                            ctx.beginPath();

                            ctx.arc(x, y, particleRadius, 0, Math.PI * 2);

                            // Subtle glow

                            ctx.shadowBlur = 7;

                            ctx.shadowColor = color;

                            ctx.fillStyle = color;

                            ctx.fill();

                            // IMPORTANT:
                            // reset shadow so it doesn't
                            // affect later drawing.

                            ctx.shadowBlur = 0;
                        });

                        // =====================================
                        // WALL IMPACT EVENTS
                        // =====================================

                        snapshot.events.forEach(function (event) {
                            if (event.type !== "wallImpact") {
                                return;
                            }

                            var x = cx + event.x * scale;

                            var y = cy - event.y * scale;

                            ctx.beginPath();

                            ctx.arc(x, y, 6, 0, Math.PI * 2);

                            ctx.strokeStyle = "#ffd166";

                            ctx.lineWidth = 2;

                            ctx.stroke();
                        });
                    }

                    function render() {
                        drawBackground();

                        var snapshot = scope.snapshot;

                        if (!snapshot) {
                            drawEmptyState();
                        } else {
                            drawSnapshot(snapshot);
                        }

                        animationFrameId = requestAnimationFrame(render);
                    }

                    window.addEventListener("resize", resize);

                    resize();

                    render();

                    scope.$on("$destroy", function () {
                        cancelAnimationFrame(animationFrameId);

                        window.removeEventListener("resize", resize);
                    });
                },
            };
        });
})();
