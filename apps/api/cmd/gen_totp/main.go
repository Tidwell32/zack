package main

import (
	"fmt"
	"log"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

func main() {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Zack's Playground",
		AccountName: "owner",
		Period:      30,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
	if err != nil {
		log.Fatalf("failed to generate TOTP key: %v", err)
	}

	fmt.Println("=== TOTP Setup ===")
	fmt.Println("Secret (AUTH_TOTP_SECRET):")
	fmt.Println(key.Secret())
	fmt.Println()
	fmt.Println("Provisioning URI (for QR code):")
	fmt.Println(key.URL())
	fmt.Println()
	fmt.Println("Use this URI in a QR generator, or enter the secret manually in Google Authenticator.")
}
