var request = require("request"),
    url = require("url");

var resolveServiceEndpoint = exports.resolveServiceEndpoint = function resolveServiceEndpoint(serviceUrl, cb) {
  var parsedUrl = url.parse(serviceUrl);

  if (!parsedUrl.hash) {
    return cb(Error("url fragment is required"));
  }

  var fragment = parsedUrl.hash.replace(/^#/, "");

  return request({uri: serviceUrl, json: true}, function(err, res, descriptionDocument) {
    if (err) {
      return cb(err);
    }

    if (res.statusCode !== 200) {
      return cb(Error("invalid status code; expected 200 but got " + res.statusCode));
    }

    if (!descriptionDocument || !descriptionDocument.services) {
      return cb(Error("response was not a valid service description object"));
    }

    var service = descriptionDocument.services[fragment];

    if (!service) {
      return cb(Error("couldn't find service `" + fragment + "'"));
    }

    if (!service.href) {
      return cb(Error("service didn't have a `href' property"));
    }

    return cb(null, url.resolve(serviceUrl, service.href));
  });
};
