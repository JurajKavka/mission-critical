.PHONY: code-quality

code-quality:
	npm run format
	npm run check
	npm run test
	npm run test:e2e
