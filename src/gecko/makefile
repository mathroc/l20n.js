DIST := $(CURDIR)/../../dist/$(shell basename $(CURDIR))

build:
	rollup IntlMessageContext.jsm \
		-c ./xpcom_config.js \
		-o $(DIST)/IntlMessageContext.jsm
	rollup l20n.js \
		-c ./bundle_config.js \
		-o $(DIST)/l20n.js
