/**
 *  @param {NS} ns
 *  @param {function} f - a function to call with each discovered server name
 */
export async function netTraverse(ns, f) {
  var prune = false;
  var quit = false;
  var ctl = {
    quit: function () { quit = true; },
    prune: function () { prune = true; }
  }

  var queue = [{ name: "home" }];
  var visited = { home: true };
  while (queue.length > 0 && !quit) {
    var s = queue.shift();
    await f(s, ctl);
    if (prune) {
      prune = false;
    } else {
      for (let neighbour of ns.scan(s.name)) {
        if (visited[neighbour] == null) {
          visited[neighbour] = true;
          queue.push({ name: neighbour, parent: s });
        }
      }
    }
  }
}