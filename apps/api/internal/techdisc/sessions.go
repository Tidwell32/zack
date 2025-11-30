package techdisc

func BuildSessionSummaries(views []ThrowView, useStrict bool) []SessionSummary {
	groupMap := make(map[string]*sessionSummaryBuilder)

	for _, view := range views {
		isOutlier := false
		if useStrict {
			isOutlier = view.IsOutlierStrict
		} else {
			isOutlier = view.IsOutlierDefault
		}

		handedness := ""
		if view.Handedness != nil {
			handedness = *view.Handedness
		}

		key := sessionKey{
			sessionDate:      view.SessionDate,
			handedness:       handedness,
			primaryThrowType: view.PrimaryThrowType,
		}

		keyStr := key.String()
		if _, exists := groupMap[keyStr]; !exists {
			groupMap[keyStr] = &sessionSummaryBuilder{
				sessionDate:      view.SessionDate,
				handedness:       view.Handedness,
				primaryThrowType: view.PrimaryThrowType,
			}
		}

		groupMap[keyStr].add(view, isOutlier)
	}

	summaries := make([]SessionSummary, 0, len(groupMap))
	for _, builder := range groupMap {
		summaries = append(summaries, builder.build())
	}

	return summaries
}

type sessionSummaryBuilder struct {
	sessionDate      string
	handedness       *string
	primaryThrowType string

	totalCount int
	cleanCount int

	sumSpeed       float64
	sumSpin        float64
	sumLaunchAngle float64
	sumNoseAngle   float64
	sumHyzerAngle  float64
}

func (b *sessionSummaryBuilder) add(view ThrowView, isOutlier bool) {
	b.totalCount++

	if isOutlier {
		return
	}

	b.cleanCount++
	b.sumSpeed += view.SpeedMph
	b.sumSpin += view.SpinRpm
	b.sumLaunchAngle += view.LaunchAngle
	b.sumNoseAngle += view.NoseAngle
	b.sumHyzerAngle += view.HyzerAngle
}

func (b *sessionSummaryBuilder) build() SessionSummary {
	if b.cleanCount == 0 {
		return SessionSummary{
			SessionDate:      b.sessionDate,
			Handedness:       b.handedness,
			PrimaryThrowType: b.primaryThrowType,
			ThrowCount:       b.totalCount,
			CleanThrowCount:  0,
		}
	}

	n := float64(b.cleanCount)

	return SessionSummary{
		SessionDate:      b.sessionDate,
		Handedness:       b.handedness,
		PrimaryThrowType: b.primaryThrowType,
		ThrowCount:       b.totalCount,
		CleanThrowCount:  b.cleanCount,
		AvgSpeedMph:      b.sumSpeed / n,
		AvgSpinRpm:       b.sumSpin / n,
		AvgLaunchAngle:   b.sumLaunchAngle / n,
		AvgNoseAngle:     b.sumNoseAngle / n,
		AvgHyzerAngle:    b.sumHyzerAngle / n,
	}
}
