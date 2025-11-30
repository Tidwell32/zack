package udisc

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func FindPrimaryPlayer(rounds []Round) string {
	counts := make(map[string]int)

	for _, r := range rounds {
		for _, p := range r.Players {
			name := strings.TrimSpace(p.PlayerName)
			if name == "" {
				continue
			}
			counts[name]++
		}
	}

	primary := ""
	max := 0
	for name, count := range counts {
		if count > max {
			max = count
			primary = name
		}
	}

	return primary
}

func ParseHoleScores(row RoundCSVRow) []int {
	raw := []string{
		row.Hole1, row.Hole2, row.Hole3, row.Hole4, row.Hole5, row.Hole6, row.Hole7,
		row.Hole8, row.Hole9, row.Hole10, row.Hole11, row.Hole12, row.Hole13,
		row.Hole14, row.Hole15, row.Hole16, row.Hole17, row.Hole18, row.Hole19,
		row.Hole20, row.Hole21,
	}

	scores := make([]int, 0, len(raw))

	for _, val := range raw {
		v := strings.TrimSpace(val)
		if v == "" {
			// assume no further holes after first blank
			break
		}
		n, err := strconv.Atoi(v)
		if err != nil {
			break
		}
		scores = append(scores, n)
	}

	return scores
}

func IsRoundComplete(scores []int, expectedHoleCount int) bool {
	if expectedHoleCount == 0 || len(scores) == 0 {
		return false
	}

	if len(scores) != expectedHoleCount {
		return false
	}

	// Last hole has score
	return scores[len(scores)-1] != 0
}

func ParseUDiscTime(value string, loc *time.Location) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return time.Time{}, fmt.Errorf("empty time")
	}

	const layout = "2006-01-02 1504"
	return time.ParseInLocation(layout, value, loc)
}

func ParsePlusMinus(plusMinus string, total *int, totalPar int) int {
	pm := strings.TrimSpace(plusMinus)

	if strings.EqualFold(pm, "E") {
		return 0
	}

	if pm == "" {
		if total != nil && totalPar > 0 {
			return *total - totalPar
		}
		return 0
	}

	val, err := strconv.Atoi(pm)
	if err != nil {
		if total != nil && totalPar > 0 {
			return *total - totalPar
		}
		return 0
	}

	return val
}

func CalculateTotalPar(pars []int) int {
	total := 0
	for _, p := range pars {
		total += p
	}
	return total
}

// Group together layouts that are within 2 par
// My local courses have a few layouts that are really just a few extra long tees,
// I'd rather directly compare these layouts instead of treating them differently.
func NormalizeCourses(rounds []Round) []RoundView {
	if len(rounds) == 0 {
		return []RoundView{}
	}

	courseGroups := make(map[string][]Round)
	for _, r := range rounds {
		courseName := strings.TrimSpace(r.CourseName)
		if courseName == "" {
			courseName = "Unknown Course"
		}
		courseGroups[courseName] = append(courseGroups[courseName], r)
	}

	result := make([]RoundView, 0, len(rounds))

	for courseName, courseRounds := range courseGroups {
		layoutGroups := make(map[string][]Round)

		for _, r := range courseRounds {
			groupKey := ""
			for key, group := range layoutGroups {
				if len(group) > 0 {
					firstRound := group[0]
					if firstRound.HoleCount == r.HoleCount {
						parDiff := abs(firstRound.TotalPar - r.TotalPar)
						if parDiff <= 2 {
							groupKey = key
							break
						}
					}
				}
			}

			if groupKey == "" {
				groupKey = fmt.Sprintf("%s_%d_%d", courseName, r.HoleCount, r.TotalPar)
			}

			layoutGroups[groupKey] = append(layoutGroups[groupKey], r)
		}

		for groupKey, groupRounds := range layoutGroups {
			firstRound := groupRounds[0]
			normalizedName := courseName

			if len(layoutGroups) > 1 {
				normalizedName = fmt.Sprintf("%s (%d holes, ~%d par)", courseName, firstRound.HoleCount, firstRound.TotalPar)
			}

			for _, r := range groupRounds {
				result = append(result, RoundView{
					Round:                r,
					NormalizedCourseId:   groupKey,
					NormalizedCourseName: normalizedName,
				})
			}
		}
	}

	return result
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
