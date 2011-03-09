all: morebits.js

# output depends on this order
MOREBITS_MODULES= morebits/portlet.js \
				  morebits/cookies.js \
				  morebits/quickform.js \
				  morebits/htmlformelement.js \
				  morebits/regexp.js \
				  morebits/sprintf.js \
				  morebits/bytes.js \
				  morebits/string.js \
				  morebits/array.js \
				  morebits/unbinder.js \
				  morebits/clone.js \
				  morebits/ln.js \
				  morebits/date.js \
				  morebits/wikipedia.js \
				  morebits/number.js \
				  morebits/mediawiki.js \
				  morebits/helpers.js \
				  morebits/querystring.js \
				  morebits/exception.js \
				  morebits/status.js \
				  morebits/simplewindow.js 

MOREBITS_FOOTER = morebits/footer.js
MOREBITS_HEADER = morebits/header.js 

morebits.js: $(MOREBITS_HEADER) $(MOREBITS_MODULES) $(MOREBITS_FOOTER)
	cat $^ > $@;

clean:
	rm -f morebits.js

.PHONY: all clean
