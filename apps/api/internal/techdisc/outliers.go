package techdisc

import (
	"fmt"
	"math"
	"sort"
	"time"
)

type sessionKey struct {
	sessionDate      string
	handedness       string
	primaryThrowType string
}

func (k sessionKey) String() string {
	return fmt.Sprintf("%s|%s|%s", k.sessionDate, k.handedness, k.primaryThrowType)
}

type sessionGroup struct {
	key    sessionKey
	throws []*ThrowView
}

func AnnotateOutliers(throws []ThrowRaw, loc *time.Location) []ThrowView {
	if loc == nil {
		loc = time.UTC
	}

	views := make([]ThrowView, len(throws))
	for i, t := range throws {
		views[i] = ThrowView{
			ThrowRaw:         t,
			SessionDate:      sessionDate(t.Time, loc),
			IsOutlierDefault: false,
			IsOutlierStrict:  false,
		}
	}

	groups := groupBySession(views)

	for _, group := range groups {
		markOutliersInGroup(group.throws)
	}

	return views
}

func sessionDate(t time.Time, loc *time.Location) string {
	tt := t.In(loc)
	y, m, d := tt.Date()
	return fmt.Sprintf("%04d-%02d-%02d", y, int(m), d)
}

func groupBySession(views []ThrowView) []sessionGroup {
	groupMap := make(map[string]*sessionGroup)

	for i := range views {
		handedness := ""
		if views[i].Handedness != nil {
			handedness = *views[i].Handedness
		}

		key := sessionKey{
			sessionDate:      views[i].SessionDate,
			handedness:       handedness,
			primaryThrowType: views[i].PrimaryThrowType,
		}

		keyStr := key.String()
		if _, exists := groupMap[keyStr]; !exists {
			groupMap[keyStr] = &sessionGroup{
				key:    key,
				throws: []*ThrowView{},
			}
		}

		groupMap[keyStr].throws = append(groupMap[keyStr].throws, &views[i])

	}

	groups := make([]sessionGroup, 0, len(groupMap))
	for _, g := range groupMap {
		groups = append(groups, *g)
	}

	return groups
}

func markOutliersInGroup(throws []*ThrowView) {
	if len(throws) == 0 {
		return
	}

	speeds := make([]float64, len(throws))
	for i, t := range throws {
		speeds[i] = t.SpeedMph
	}

	medianSpeed := median(speeds)
	madSpeed := mad(speeds, medianSpeed)

	if madSpeed < 1.0 {
		madSpeed = 1.0
	}

	defaultSpeedMin := medianSpeed - 2.0*madSpeed
	strictSpeedMin := medianSpeed - 1.3*madSpeed

	for _, t := range throws {
		speedOutDefault := t.SpeedMph < defaultSpeedMin
		speedOutStrict := t.SpeedMph < strictSpeedMin

		angleOutDefault := isAngleOutlierDefault(t.LaunchAngle, t.NoseAngle)
		angleOutStrict := isAngleOutlierStrict(t.LaunchAngle, t.NoseAngle)

		t.IsOutlierDefault = speedOutDefault || angleOutDefault
		t.IsOutlierStrict = speedOutStrict || angleOutStrict
	}
}

func isAngleOutlierDefault(launch, nose float64) bool {
	return launch < -25 || launch > 35 || nose < -25 || nose > 25
}

func isAngleOutlierStrict(launch, nose float64) bool {
	return launch < -20 || launch > 25 || nose < -20 || nose > 20
}

func median(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	sorted := make([]float64, len(values))
	copy(sorted, values)
	sort.Float64s(sorted)

	n := len(sorted)
	if n%2 == 0 {
		return (sorted[n/2-1] + sorted[n/2]) / 2.0
	}
	return sorted[n/2]
}

// Median Absolute Deviation
func mad(values []float64, med float64) float64 {
	if len(values) == 0 {
		return 0
	}

	deviations := make([]float64, len(values))
	for i, v := range values {
		deviations[i] = math.Abs(v - med)
	}

	return median(deviations)
}
