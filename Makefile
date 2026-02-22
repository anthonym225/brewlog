.PHONY: dev ios android

dev:
	npx expo start

ios:
	npx expo start --ios

android:
	npx expo start --android
