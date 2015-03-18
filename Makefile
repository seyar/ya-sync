NPM_BIN=./node_modules/.bin

lint:
	@$(NPM_BIN)/jshint .
	@$(NPM_BIN)/jscs .

.PHONY: lint

.PHONY: test
test:
	@$(NPM_BIN)/mocha -R spec --recursive
